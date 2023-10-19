// Package notify contains helper functions for sending notifications.
package notify

import (
	"bytes"
	"context"
	"crypto/ecdh"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/cryptolib"
	"github.com/candiddev/shared/go/jwt"
	"github.com/candiddev/shared/go/logger"
)

func TestWebPushSend(t *testing.T) {
	logger.UseTestLogger(t)

	legacyPrv := "3-NI4eCXzQt3ILqRmOaIuEWHCl9Lp7zrOlGhhdyy7MU"
	legacyPub := "BMcCmv0dhitH4h1hrKHGpJbaD_kTPpaGap8AH4kjLoM7pZXPzdPgCASqZ9pMOZckHD62xvXFtfWbxLBzJGzWtU4"

	srvPrv, srvPub, err := NewWebPushVAPID()
	assert.HasErr(t, err, nil)

	cprv, _, err := cryptolib.NewECP256()
	assert.HasErr(t, err, nil)

	key, err := cprv.PrivateKeyECDH()
	assert.HasErr(t, err, nil)

	cliPrv := base64.RawURLEncoding.EncodeToString(key.Bytes())
	cliPub := base64.RawURLEncoding.EncodeToString(key.PublicKey().Bytes())

	msg := WebPushMessage{
		Actions: WebPushActions{
			Default:    "c",
			Target:     "a",
			TargetType: "b",
			Types: []WebPushActionType{
				1,
			},
		},
		Body:    "Hello world!",
		Subject: "Greetings",
		Topic:   "topic1",
		TTL:     100,
		Urgency: WebPushUrgencyHigh,
	}

	var gotBody []byte

	var gotHeader http.Header

	var resStatus int

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Header.Del("User-Agent")
		r.Header.Del("Accept-Encoding")

		gotHeader = r.Header
		gotBody, _ = io.ReadAll(r.Body)

		w.WriteHeader(resStatus)
	}))

	cli := &WebPushClient{
		Auth:     "lDVz2GD0oypIBSDIEnIe6A",
		Endpoint: srv.URL,
		P256:     cliPub,
	}

	tests := map[string]struct {
		cliPrv    string
		client    *WebPushClient
		resStatus int
		srvPrv    string
		srvPub    string
		wantErr   error
	}{
		"no server": {
			wantErr: ErrCancelled,
		},
		"no client": {
			srvPrv:  srvPrv,
			srvPub:  srvPub,
			wantErr: ErrCancelled,
		},
		"bad client": {
			client: &WebPushClient{
				Auth:     "#*&&%*@(%*@)!(%_)",
				Endpoint: srv.URL,
				P256:     cliPub,
			},
			srvPrv:  srvPrv,
			srvPub:  srvPub,
			wantErr: ErrSend,
		},
		"bad request": {
			client:    cli,
			resStatus: http.StatusBadRequest,
			srvPrv:    srvPrv,
			srvPub:    srvPub,
			wantErr:   ErrSend,
		},
		"forbidden": {
			client:    cli,
			resStatus: http.StatusForbidden,
			srvPrv:    srvPrv,
			srvPub:    srvPub,
			wantErr:   ErrSend,
		},
		"not found": {
			client:    cli,
			resStatus: http.StatusNotFound,
			srvPrv:    srvPrv,
			srvPub:    srvPub,
			wantErr:   ErrMissing,
		},
		"gone": {
			client:    cli,
			resStatus: http.StatusGone,
			srvPrv:    srvPrv,
			srvPub:    srvPub,
			wantErr:   ErrMissing,
		},
		"too large": {
			client:    cli,
			resStatus: http.StatusRequestEntityTooLarge,
			srvPrv:    srvPrv,
			srvPub:    srvPub,
			wantErr:   ErrSend,
		},
		"too many requests": {
			client:    cli,
			resStatus: http.StatusTooManyRequests,
			srvPrv:    srvPrv,
			srvPub:    srvPub,
			wantErr:   ErrSend,
		},
		"good_new": {
			client: &WebPushClient{
				Auth:     cli.Auth,
				Endpoint: srv.URL,
				P256:     cliPub,
			},
			cliPrv:    cliPrv,
			resStatus: http.StatusCreated,
			srvPrv:    srvPrv,
			srvPub:    srvPub,
		},
		"good_legacy": {
			client: &WebPushClient{
				Auth:     cli.Auth,
				Endpoint: srv.URL,
				P256:     legacyPub,
			},
			cliPrv:    legacyPrv,
			resStatus: http.StatusCreated,
			srvPrv:    legacyPrv,
			srvPub:    legacyPub,
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			c := WebPush{
				VAPIDPublicKey:  tc.srvPub,
				VAPIDPrivateKey: tc.srvPrv,
			}

			ctx := context.Background()
			m := msg
			m.Client = tc.client
			resStatus = tc.resStatus

			assert.HasErr(t, c.Send(ctx, "hello", &m), tc.wantErr)

			if tc.wantErr == nil {
				assert.Equal(t, gotHeader.Get("Content-Encoding"), "aes128gcm")
				assert.Equal(t, gotHeader.Get("Content-Type"), "application/octet-stream")
				assert.Equal(t, gotHeader.Get("Crypto-Key"), fmt.Sprintf("p256ecdsa=%s", tc.srvPub))
				assert.Equal(t, gotHeader.Get("TTL"), "100")
				assert.Equal(t, gotHeader.Get("Topic"), "topic1")
				assert.Equal(t, gotHeader.Get("Urgency"), "high")

				srvB, err := base64.RawURLEncoding.DecodeString(tc.srvPub)
				assert.HasErr(t, err, nil)

				token, _, err := jwt.Parse(strings.Split(gotHeader.Get("Authorization"), " ")[1], cryptolib.KeysVerify{
					{
						Key: cryptolib.Key[cryptolib.KeyProviderVerify]{
							Key: cryptolib.ECP256PublicKey(base64.StdEncoding.EncodeToString(srvB)),
						},
					},
				})
				assert.HasErr(t, err, nil)

				wp := webPushJWT{}
				assert.HasErr(t, token.ParsePayload(&wp, "", "", ""), nil)

				assert.HasErr(t, err, nil)
				assert.Equal(t, len(gotBody), 4096)
				assert.Equal(t, wp.Audience[0], strings.Join(strings.Split(srv.URL, ":")[:2], ":"))
				assert.Equal(t, time.Unix(wp.ExpiresAt, 0).After(time.Now().Add(4*time.Hour)), true)
				assert.Equal(t, wp.Subject, "hello")

				salt := gotBody[:16] // Salt is 16 characters
				l := int(gotBody[20])
				srvPub, err := ecdh.P256().NewPublicKey(gotBody[21 : 21+l])
				assert.HasErr(t, err, nil)
				auth, err := base64.RawURLEncoding.DecodeString(cli.Auth)
				assert.HasErr(t, err, nil)

				cliPrvB, err := base64.RawURLEncoding.DecodeString(tc.cliPrv)
				assert.HasErr(t, err, nil)
				cliPrvP, err := ecdh.P256().NewPrivateKey(cliPrvB)
				assert.HasErr(t, err, nil)

				gcm, nonce, err := getWebPushCipherNonce(srvPub, cliPrvP, auth, salt, true)
				assert.HasErr(t, err, nil)
				ct, err := gcm.Open([]byte{}, nonce, gotBody[21+l:], nil)
				assert.HasErr(t, err, nil)

				j := map[string]any{}

				assert.HasErr(t, json.Unmarshal(bytes.Split(ct, []byte("\x02"))[0], &j), nil)
				assert.Equal(t, j["actions"].(map[string]any)["default"], "c")
				assert.Equal(t, j["body"].(string), "Hello world!")
				assert.Equal(t, j["subject"].(string), "Greetings")
			}
		})
	}
}
