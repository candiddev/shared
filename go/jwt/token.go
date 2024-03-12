package jwt

import (
	"crypto"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/candiddev/shared/go/cryptolib"
	"github.com/candiddev/shared/go/types"
)

var (
	ErrGetSigningMethod            = errors.New("unknown crypto signer")
	ErrNewMarshalJSON              = errors.New("error converting claims to JSON")
	ErrParseFormat                 = errors.New("jwt has invalid format")
	ErrParseNoPublicKeys           = errors.New("can't verify JWT without public keys")
	ErrParseSigningMethod          = errors.New("signing method doesn't match verifier")
	ErrTokenParsePayloadValidation = errors.New("error validating token claims")
	ErrUnmarshalingJWT             = errors.New("error unmarshaling JWT")
)

// Token is a parsed JWT.
type Token struct {
	Header          TokenHeader
	HeaderBase64    string
	PayloadBase64   string
	SignatureBase64 string
}

// Algorithm is how the JWT will be signed.
type Algorithm string

// Algorithms supported for JWT signing.
const (
	AlgorithmES2565 = "ES256"
	AlgorithmEdDSA  = "EdDSA"
	AlgorithmRS256  = "RS256"
)

// TokenHeader is a JWT header.
type TokenHeader struct {
	Algorithm Algorithm `json:"alg"`
	KeyID     string    `json:"kid,omitempty"`
	Type      string    `json:"typ"`
}

func getSigningMethod(k cryptolib.Algorithm) (Algorithm, error) {
	switch k { //nolint:exhaustive
	case cryptolib.AlgorithmECP256Private:
		fallthrough
	case cryptolib.AlgorithmECP256Public:
		return AlgorithmES2565, nil
	case cryptolib.AlgorithmEd25519Private:
		fallthrough
	case cryptolib.AlgorithmEd25519Public:
		return AlgorithmEdDSA, nil
	case cryptolib.AlgorithmRSA2048Private:
		fallthrough
	case cryptolib.AlgorithmRSA2048Public:
		return AlgorithmES2565, nil
	}

	return "", fmt.Errorf("%s: %w", k, ErrGetSigningMethod)
}

// New creates a new Token from CustomClaims.
func New(claims any, expiresAt time.Time, audience []string, id, issuer, subject string) (*Token, *RegisteredClaims, error) { //nolint:revive
	t := Token{}
	r := RegisteredClaims{}

	var expires int64

	if !expiresAt.IsZero() {
		expires = expiresAt.Unix()
	}

	r.Audience = audience
	r.ExpiresAt = expires
	r.ID = id
	r.IssuedAt = time.Now().Unix()
	r.Issuer = issuer
	r.NotBefore = time.Now().Unix()
	r.Subject = subject

	m := map[string]any{}

	if claims != nil {
		if err := types.AppendStructToMap(claims, &m); err != nil {
			return nil, &r, fmt.Errorf("%w: %w", ErrNewMarshalJSON, err)
		}
	}

	if err := types.AppendStructToMap(r, &m); err != nil {
		return nil, &r, fmt.Errorf("%w: %w", ErrNewMarshalJSON, err)
	}

	p, err := json.Marshal(m)
	if err != nil {
		return nil, &r, fmt.Errorf("%w: %w", ErrNewMarshalJSON, err)
	}

	t.PayloadBase64 = base64.RawURLEncoding.EncodeToString(p)

	return &t, &r, nil
}

// Parse takes a token and parses it into a Token struct for future use and the public key that verified it.  Returns an error if the signature does not match or the token format is invalid.
func Parse(token string, keys cryptolib.Keys[cryptolib.KeyProviderPublic]) (*Token, cryptolib.Key[cryptolib.KeyProviderPublic], error) {
	var p cryptolib.Key[cryptolib.KeyProviderPublic]

	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, p, ErrParseFormat
	}

	h, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return nil, p, fmt.Errorf("%w: %w", ErrParseFormat, err)
	}

	header := TokenHeader{}

	if err := json.Unmarshal(h, &header); err != nil {
		return nil, p, fmt.Errorf("%w: %w", ErrParseFormat, err)
	}

	t := &Token{
		Header:          header,
		HeaderBase64:    parts[0],
		PayloadBase64:   parts[1],
		SignatureBase64: parts[2],
	}

	if len(keys) == 0 {
		return t, p, ErrParseNoPublicKeys
	}

	sig, err := base64.RawURLEncoding.DecodeString(t.SignatureBase64)
	if err != nil {
		return nil, p, fmt.Errorf("%w: %w", ErrParseFormat, err)
	}

	for i := range keys {
		err = keys[i].Key.Verify([]byte(strings.Join(parts[0:2], ".")), header.getHash(), sig)
		if err == nil {
			p = keys[i]

			break
		}
	}

	if err != nil {
		return t, p, err
	}

	m, err := getSigningMethod(p.Key.Algorithm())
	if err != nil {
		return t, p, err
	}

	if m != header.Algorithm {
		return t, p, ErrParseSigningMethod
	}

	return t, p, nil
}

func (h *TokenHeader) getHash() crypto.Hash {
	if h.Algorithm == AlgorithmES2565 || h.Algorithm == AlgorithmRS256 {
		return crypto.SHA256
	}

	return 0
}

// GetSignMessage is the message contents that need to be signed.
func (t *Token) GetSignMessage(a Algorithm, keyID string) (string, error) {
	t.Header = TokenHeader{
		Algorithm: a,
		KeyID:     keyID,
		Type:      "JWT",
	}

	p, err := json.Marshal(t.Header)
	if err != nil {
		return "", fmt.Errorf("%w: %w", ErrNewMarshalJSON, err)
	}

	t.HeaderBase64 = base64.RawURLEncoding.EncodeToString(p)

	return t.HeaderBase64 + "." + t.PayloadBase64, nil
}

// ParsePayload parses a token payload and validates it.  Returns an error if any validation fails.
func (t *Token) ParsePayload(claims any, audRegex string, jidRegex string, subRegex string) (*RegisteredClaims, error) {
	p64, err := base64.RawURLEncoding.DecodeString(t.PayloadBase64)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrUnmarshalingJWT, err)
	}

	// Check claims
	r := RegisteredClaims{}

	err = json.Unmarshal(p64, &r)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrUnmarshalingJWT, err)
	}

	// Parse payload
	if claims != nil {
		err = json.Unmarshal(p64, claims)
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrUnmarshalingJWT, err)
		}
	}

	if audRegex != "" {
		audReg, err := regexp.Compile(audRegex)
		if err != nil {
			return &r, fmt.Errorf("%w: error compiling audience regex: %w", ErrTokenParsePayloadValidation, err)
		}

		match := false

		for i := range r.Audience {
			if audReg.MatchString(r.Audience[i]) {
				match = true

				break
			}
		}

		if !match {
			return &r, fmt.Errorf("%w: no aud matches", ErrTokenParsePayloadValidation)
		}
	}

	if jidRegex != "" {
		jidReg, err := regexp.Compile(jidRegex)
		if err != nil {
			return &r, fmt.Errorf("%w: error compiling id regex: %w", ErrTokenParsePayloadValidation, err)
		}

		if !jidReg.MatchString(r.ID) {
			return &r, fmt.Errorf("%w: no jid matches", ErrTokenParsePayloadValidation)
		}
	}

	now := time.Now()

	// Allow up to 30 seconds clock skew for nbf and eat claims
	if time.Unix(r.NotBefore, 0).After(now.Add(time.Second * 30)) {
		return &r, fmt.Errorf("%w: token is not valid yet", ErrTokenParsePayloadValidation)
	}

	if r.ExpiresAt != 0 && now.Add(time.Second*-30).After(time.Unix(r.ExpiresAt, 0)) {
		return &r, fmt.Errorf("%w: token has expired", ErrTokenParsePayloadValidation)
	}

	if subRegex != "" {
		subReg, err := regexp.Compile(jidRegex)
		if err != nil {
			return &r, fmt.Errorf("%w: error compiling id regex: %w", ErrTokenParsePayloadValidation, err)
		}

		if !subReg.MatchString(r.ID) {
			return &r, fmt.Errorf("%w: no jid matches", ErrTokenParsePayloadValidation)
		}
	}

	return &r, nil
}

func (t *Token) Sign(k cryptolib.Key[cryptolib.KeyProviderPrivate]) error {
	a, err := getSigningMethod(k.Key.Algorithm())
	if err != nil {
		return err
	}

	m, err := t.GetSignMessage(a, k.ID)
	if err != nil {
		return err
	}

	sig, err := k.Key.Sign([]byte(m), t.Header.getHash())
	if err != nil {
		return err
	}

	t.SignatureBase64 = base64.RawURLEncoding.EncodeToString(sig)

	return nil
}

func (t *Token) String() string {
	return fmt.Sprintf("%s.%s.%s", t.HeaderBase64, t.PayloadBase64, t.SignatureBase64)
}

func (t *Token) Values() (string, error) {
	h := map[string]any{}

	if err := types.AppendStructToMap(t.Header, &h); err != nil {
		return "", err
	}

	b, err := base64.RawURLEncoding.DecodeString(t.PayloadBase64)
	if err != nil {
		return "", fmt.Errorf("error parsing payload: %w", err)
	}

	p := map[string]any{}

	if err := json.Unmarshal(b, &p); err != nil {
		return "", err
	}

	return types.JSONToString(map[string]any{
		"header":    h,
		"payload":   p,
		"signature": t.SignatureBase64,
	}), nil
}
