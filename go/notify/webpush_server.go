// Package notify contains helper functions for sending notifications.
package notify

import (
	"bytes"
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/ecdh"
	"crypto/rand"
	"crypto/sha256"
	"database/sql/driver"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/candiddev/shared/go/cryptolib"
	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/jwt"
	"github.com/candiddev/shared/go/logger"
	"github.com/candiddev/shared/go/metrics"
	"golang.org/x/crypto/hkdf"
)

// WebPush is the server details for sending push notifications.
type WebPush struct {
	VAPIDPrivateKey string `json:"vapidPrivateKey"`
	VAPIDPublicKey  string `json:"vapidPublicKey"`
}

// WebPushActionType is the type action in the message.
type WebPushActionType int

// WebPushUrgency is the priority for the message.
type WebPushUrgency string

// WebPushUrgency is the priority for the message.
const (
	WebPushUrgencyVeryLow WebPushUrgency = "very-low"
	WebPushUrgencyLow     WebPushUrgency = "low"
	WebPushUrgencyNormal  WebPushUrgency = "normal"
	WebPushUrgencyHigh    WebPushUrgency = "high"
)

// WebPushMessage contains the details for sending a webpush message.
type WebPushMessage struct {
	Actions WebPushActions
	Body    string
	Client  *WebPushClient
	Subject string
	Topic   string
	TTL     int
	Urgency WebPushUrgency
}

// NewWebPushVAPID generates a new private and public VAPID.
func NewWebPushVAPID() (prv, pub string, err error) {
	prv1, pub1, err := cryptolib.NewECP256()
	if err != nil {
		return "", "", fmt.Errorf("error generating private key: %w", err)
	}

	pr, err := base64.StdEncoding.DecodeString(string(prv1))
	if err != nil {
		return "", "", fmt.Errorf("error generating private key: %w", err)
	}

	pu, err := base64.StdEncoding.DecodeString(string(pub1))
	if err != nil {
		return "", "", fmt.Errorf("error generating private key: %w", err)
	}

	return base64.RawURLEncoding.EncodeToString(pr), base64.RawURLEncoding.EncodeToString(pu), nil
}

// WebPushActions are the actions to take for the web push.
type WebPushActions struct {
	Default    string              `json:"default"`
	Target     string              `json:"target"`
	TargetType string              `json:"targetType"`
	Types      []WebPushActionType `json:"types"`
}

// Scan reads in a WebPushActions from a database.
func (c *WebPushActions) Scan(src any) error {
	if src != nil {
		source := string(src.([]byte))

		if strings.Contains(source, `{`) {
			err := json.Unmarshal(src.([]byte), c)

			return err
		} else if source == "{}" {
			return nil
		}
	}

	return nil
}

// Value converts a WebPushActions to JSON.
func (c WebPushActions) Value() (driver.Value, error) {
	j, err := json.Marshal(c)

	return j, err
}

type webPushJWT struct {
	jwt.RegisteredClaims
}

func (w *webPushJWT) GetRegisteredClaims() *jwt.RegisteredClaims {
	return &w.RegisteredClaims
}

func (*webPushJWT) Valid() error {
	return nil
}

func getWebPushCipherNonce(client *ecdh.PublicKey, server *ecdh.PrivateKey, auth, salt []byte, reversePRK bool) (gcm cipher.AEAD, nonce []byte, err error) {
	prk := bytes.NewBufferString("WebPush: info\x00")

	if reversePRK {
		prk.Write(server.PublicKey().Bytes())
		prk.Write(client.Bytes())
	} else {
		prk.Write(client.Bytes())
		prk.Write(server.PublicKey().Bytes())
	}

	key, err := server.ECDH(client)
	if err != nil {
		return nil, nil, fmt.Errorf("error generating shared secret: %w", err)
	}

	prkHKDF := hkdf.New(sha256.New, key, auth, prk.Bytes())
	ikm := make([]byte, 32)

	if _, err := io.ReadFull(prkHKDF, ikm); err != nil {
		return nil, nil, fmt.Errorf("error generating ikm: %w", err)
	}

	cekInfo := []byte("Content-Encoding: aes128gcm\x00")
	cekHKDF := hkdf.New(sha256.New, ikm, salt, cekInfo)
	cek := make([]byte, 16)

	if _, err := io.ReadFull(cekHKDF, cek); err != nil {
		return nil, nil, fmt.Errorf("error generating cek: %w", err)
	}

	nonceInfo := []byte("Content-Encoding: nonce\x00")
	nonceHKDF := hkdf.New(sha256.New, ikm, salt, nonceInfo)
	nonce = make([]byte, 12)

	if _, err := io.ReadFull(nonceHKDF, nonce); err != nil {
		return nil, nil, fmt.Errorf("error generating nonce: %w", err)
	}

	aesc, err := aes.NewCipher(cek)
	if err != nil {
		return nil, nil, fmt.Errorf("error generating AES cipher: %w", err)
	}

	gcm, err = cipher.NewGCM(aesc)
	if err != nil {
		return nil, nil, fmt.Errorf("error creating gcm: %w", err)
	}

	return gcm, nonce, nil
}

// generateJWT must be called during a mutex lock.
func (c *WebPush) getJWT(baseURL, endpoint string) (string, error) {
	u, err := url.Parse(endpoint)
	if err != nil {
		return "", fmt.Errorf("error parsing endpoint: %w", err)
	}

	w := &webPushJWT{}

	t, err := jwt.New(w, time.Now().Add(5*time.Hour), []string{fmt.Sprintf("%s://%s", u.Scheme, u.Hostname())}, "", "", baseURL)
	if err != nil {
		return "", err
	}

	b, err := base64.RawURLEncoding.DecodeString(c.VAPIDPrivateKey)
	if err != nil {
		return "", fmt.Errorf("error decoding private key: %w", err)
	}

	if err := t.Sign(cryptolib.Key[cryptolib.KeyProviderPrivate]{
		Key: cryptolib.ECP256PrivateKey(base64.StdEncoding.EncodeToString(b)),
	}); err != nil {
		return "", err
	}

	return t.String(), nil
}

// Send POSTs a WebPushMessage to a WebPush provider.
func (c *WebPush) Send(ctx context.Context, baseURL string, m *WebPushMessage) errs.Err {
	if c.VAPIDPrivateKey == "" || c.VAPIDPublicKey == "" {
		metrics.Notifications.WithLabelValues("webpush", "cancelled").Add(1)

		return logger.Error(ctx, NewErrCancelled("no vapid config"))
	}

	if m.Client == nil || (m.Client.Auth == "" || m.Client.Endpoint == "" || m.Client.P256 == "") {
		metrics.Notifications.WithLabelValues("webpush", "cancelled").Add(1)

		return logger.Error(ctx, NewErrCancelled("no valid recipients"))
	}

	ctx = logger.SetAttribute(ctx, "webPushEndpoint", m.Client.Endpoint)

	auth, p256, err := m.Client.decode()
	if err != nil {
		metrics.Notifications.WithLabelValues("webpush", "failure").Add(1)

		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrSend, fmt.Errorf("error decoding client: %w", err)))
	}

	prv, pub, err := cryptolib.NewECP256()
	if err != nil {
		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrSend, fmt.Errorf("error generating keys: %w", err)))
	}

	prvECDH, err := prv.PrivateKeyECDH()
	if err != nil {
		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrSend, fmt.Errorf("error generating keys: %w", err)))
	}

	pubECDH, err := pub.PublicKeyECDH()
	if err != nil {
		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrSend, fmt.Errorf("error generating keys: %w", err)))
	}

	salt := make([]byte, 16)

	if _, err := io.ReadFull(rand.Reader, salt); err != nil {
		metrics.Notifications.WithLabelValues("webpush", "failure").Add(1)

		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrSend, fmt.Errorf("error generating salt: %w", err)))
	}

	gcm, nonce, err := getWebPushCipherNonce(p256, prvECDH, auth, salt, false)
	if err != nil {
		metrics.Notifications.WithLabelValues("webpush", "failure").Add(1)

		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrSend, fmt.Errorf("error generating crypto: %w", err)))
	}

	token, err := c.getJWT(baseURL, m.Client.Endpoint)
	if err != nil {
		metrics.Notifications.WithLabelValues("webpush", "failure").Add(1)

		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrSend, fmt.Errorf("error creating jwt: %w", err)))
	}

	recordBuf := bytes.NewBuffer(salt)
	rs := make([]byte, 4)
	binary.BigEndian.PutUint32(rs, 4096)
	recordBuf.Write(rs)
	recordBuf.Write([]byte{byte(len(pubECDH.Bytes()))})
	recordBuf.Write(pubECDH.Bytes())

	j, err := json.Marshal(map[string]any{
		"actions": m.Actions,
		"body":    m.Body,
		"subject": m.Subject,
	})
	if err != nil {
		metrics.Notifications.WithLabelValues("webpush", "failure").Add(1)

		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrSend, fmt.Errorf("error creating body: %w", err)))
	}

	b := bytes.NewBuffer(j)
	b.WriteString("\x02")
	b.Write(make([]byte, 4096-16-recordBuf.Len()-b.Len()))

	d := gcm.Seal([]byte{}, nonce, b.Bytes(), nil)

	recordBuf.Write(d)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, m.Client.Endpoint, recordBuf)
	if err != nil {
		metrics.Notifications.WithLabelValues("webpush", "failure").Add(1)

		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrSend, fmt.Errorf("error creating request: %w", err)))
	}

	req.Header.Add("Authorization", fmt.Sprintf("WebPush %s", token))
	req.Header.Add("Content-Encoding", "aes128gcm")
	req.Header.Add("Content-Type", "application/octet-stream")
	req.Header.Add("Crypto-Key", fmt.Sprintf("p256ecdsa=%s", c.VAPIDPublicKey))
	req.Header.Add("TTL", strconv.Itoa(m.TTL))

	if m.Topic != "" {
		req.Header.Add("Topic", m.Topic)
	}

	if m.Urgency == "" {
		m.Urgency = WebPushUrgencyNormal
	}

	req.Header.Add("Urgency", string(m.Urgency))

	var client http.Client

	res, err := client.Do(req)
	if err != nil {
		metrics.Notifications.WithLabelValues("webpush", "failure").Add(1)

		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrSend, fmt.Errorf("error performing webpush request: %w", err)))
	}

	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		metrics.Notifications.WithLabelValues("webpush", "failure").Add(1)

		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrSend, fmt.Errorf("error reading body: %w", err)))
	}

	var e errs.Err

	switch res.StatusCode {
	case http.StatusCreated:
		metrics.Notifications.WithLabelValues("webpush", "success").Add(1)
	case http.StatusBadRequest:
		fallthrough
	case http.StatusForbidden:
		metrics.Notifications.WithLabelValues("webpush", "failure").Add(1)

		e = errs.ErrReceiver.Wrap(ErrSend, fmt.Errorf("endpoint %s reported bad request: %s", m.Client.Endpoint, body))
	case http.StatusNotFound:
		fallthrough
	case http.StatusGone:
		metrics.Notifications.WithLabelValues("webpush", "cancelled").Add(1)

		e = errs.ErrReceiver.Wrap(ErrMissing)
	case http.StatusRequestEntityTooLarge:
		metrics.Notifications.WithLabelValues("webpush", "failure").Add(1)

		e = errs.ErrReceiver.Wrap(ErrSend, fmt.Errorf("endpoint %s reported request too large", m.Client.Endpoint))
	case http.StatusTooManyRequests:
		metrics.Notifications.WithLabelValues("webpush", "failure").Add(1)

		e = errs.ErrReceiver.Wrap(ErrSend, fmt.Errorf("endpoint %s is rate-limited", m.Client.Endpoint))
	}

	return logger.Error(ctx, e)
}
