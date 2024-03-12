package jwt

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/cryptolib"
	"github.com/candiddev/shared/go/types"
)

func TestToken(t *testing.T) {
	ed25519prv, ed25519pub, _ := cryptolib.NewEd25519()
	ecp256prv, ecp256pub, _ := cryptolib.NewECP256()
	rsa2048prv, rsa2048pub, _ := cryptolib.NewRSA2048()

	tests := map[string]struct {
		private cryptolib.KeyProviderPrivate
		public  cryptolib.KeyProviderPublic
	}{
		"ed25519": {
			private: ed25519prv,
			public:  ed25519pub,
		},
		"ecp256": {
			private: ecp256prv,
			public:  ecp256pub,
		},
		"rsa2048": {
			private: rsa2048prv,
			public:  rsa2048pub,
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			e := time.Now().Add(10 * time.Second)

			prv := cryptolib.Key[cryptolib.KeyProviderPrivate]{
				ID:  types.RandString(10),
				Key: tc.private,
			}
			pub := cryptolib.Key[cryptolib.KeyProviderPublic]{
				ID:  types.RandString(10),
				Key: tc.public,
			}
			j1 := jwtCustom{
				Licensed: true,
			}

			got1, r1, err := New(&j1, e, []string{"audience"}, "id", "issuer", "subject")
			assert.HasErr(t, err, nil)
			assert.Equal(t, r1.Audience, []string{"audience"})
			assert.Equal(t, r1.ExpiresAt, e.Unix())
			assert.Equal(t, r1.ID, "id")
			assert.Equal(t, r1.IssuedAt, e.Unix()-10)
			assert.Equal(t, r1.Issuer, "issuer")
			assert.Equal(t, r1.NotBefore, e.Unix()-10)
			assert.Equal(t, r1.Subject, "subject")

			m := map[string]any{}
			types.AppendStructToMap(j1, &m)
			types.AppendStructToMap(r1, &m)

			js, _ := json.Marshal(m)
			assert.Equal(t, got1.PayloadBase64, base64.RawURLEncoding.EncodeToString(js))

			a, err := getSigningMethod(prv.Key.Algorithm())
			assert.HasErr(t, err, nil)

			m1, _ := got1.GetSignMessage(a, prv.ID)
			assert.Equal(t, got1.HeaderBase64 != "", true)
			assert.Equal(t, m1, got1.HeaderBase64+"."+got1.PayloadBase64)

			assert.HasErr(t, got1.Sign(prv), nil)
			assert.Equal(t, got1.SignatureBase64 != "", true)

			gotT1, p, err := Parse(got1.String(), cryptolib.Keys[cryptolib.KeyProviderPublic]{
				pub,
			})
			assert.HasErr(t, err, nil)
			assert.Equal(t, p, pub)

			jOut1 := &jwtCustom{}
			r, err := gotT1.ParsePayload(jOut1, "", "", "")
			assert.HasErr(t, err, nil)
			assert.Equal(t, jOut1, &j1)
			assert.Equal(t, r, r1)

			m2, _ := gotT1.GetSignMessage(a, prv.ID)
			assert.Equal(t, gotT1.Header, got1.Header)
			assert.Equal(t, m1, m2)

			j2 := jwtCustom{
				Licensed: true,
			}

			got2, r2, err := New(&j2, e, []string{"1", "2"}, "id", "issuer", "subject")
			assert.HasErr(t, err, nil)
			assert.HasErr(t, got2.Sign(prv), nil)

			gotT2, _, err := Parse(got2.String(), cryptolib.Keys[cryptolib.KeyProviderPublic]{
				pub,
			})
			assert.HasErr(t, err, nil)

			jOut2 := &jwtCustom{}

			r, err = gotT2.ParsePayload(jOut2, "", "", "")
			assert.HasErr(t, err, nil)
			assert.Equal(t, jOut2, &j2)
			assert.Equal(t, r, r2)
		})
	}
}

func TestValues(t *testing.T) {
	prv, _, _ := cryptolib.NewKeysAsymmetric(cryptolib.AlgorithmBest)

	tok, r, _ := New(map[string]any{
		"a": "a",
		"b": true,
		"i": 1,
	}, time.Now().Add(time.Hour), []string{"audience"}, "id", "issuer", "subject")

	tok.Sign(prv)

	s, err := tok.Values()

	assert.HasErr(t, err, nil)
	assert.Equal(t, s, fmt.Sprintf(`{
  "header": {
    "alg": "EdDSA",
    "kid": "%s",
    "typ": "JWT"
  },
  "payload": {
    "a": "a",
    "aud": "audience",
    "b": true,
    "exp": %d,
    "i": 1,
    "iat": %d,
    "iss": "issuer",
    "jti": "id",
    "nbf": %d,
    "sub": "subject"
  },
  "signature": "%s"
}`, prv.ID, r.ExpiresAt, r.IssuedAt, r.NotBefore, tok.SignatureBase64))
}
