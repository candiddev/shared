package cryptolib

import (
	"encoding/base64"
	"fmt"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestNewSignatureVerify(t *testing.T) {
	edprv, edpub, _ := NewKeysEncryptAsymmetric(AlgorithmEd25519)
	ecprv, ecpub, _ := NewKeysEncryptAsymmetric(AlgorithmECP256)
	rsprv, rspub, _ := NewKeysEncryptAsymmetric(AlgorithmRSA2048)
	msg := []byte("hello world")
	tests := map[string]struct {
		sign          Key[KeyProviderPrivate]
		verify        Key[KeyProviderPublic]
		wantSignErr   error
		wantVerifyErr error
	}{
		"ed25519": {
			sign:   edprv,
			verify: edpub,
		},
		"ecp256": {
			sign:   ecprv,
			verify: ecpub,
		},
		"rsa": {
			sign:   rsprv,
			verify: rspub,
		},
		"wrong": {
			sign: Key[KeyProviderPrivate]{
				Key: Ed25519PrivateKey("hello"),
			},
			verify:      rspub,
			wantSignErr: ErrDecodingPrivateKey,
		},
		"mix": {
			sign:          ecprv,
			verify:        rspub,
			wantVerifyErr: ErrVerify,
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			sig, err := NewSignature(tc.sign, msg)
			assert.HasErr(t, err, tc.wantSignErr)

			if tc.wantSignErr == nil {
				assert.HasErr(t, sig.Verify(msg, Keys[KeyProviderPublic]{
					tc.verify,
				}), tc.wantVerifyErr)
			}
		})
	}
}

func TestParseSignature(t *testing.T) {
	tests := map[string]struct {
		err   error
		input SignatureHash
		want  string
	}{
		"ed25519": {
			input: SignatureHashEd25519 + ":YQ==:123",
			want:  "ed25519:YQ==:123",
		},
		"sha256": {
			input: SignatureHashSHA256 + ":YQ==:123",
			want:  "sha256:YQ==:123",
		},
		"unknown": {
			input: SignatureHash("blake:YQ==:123"),
			err:   ErrUnknownHash,
			want:  "::",
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			got, err := ParseSignature(string(tc.input))
			assert.Equal(t, err, tc.err)
			assert.Equal(t, got.String(), tc.want)
		})
	}
}

func TestSignature(t *testing.T) {
	prv, _, _ := NewKeysEncryptAsymmetric(AlgorithmBest)

	sig, _ := NewSignature(prv, []byte("helloworld"))

	// Marshal
	strout := fmt.Sprintf("%s:%s:%s", sig.Hash, base64.StdEncoding.EncodeToString(sig.Signature), sig.KeyID)
	bytout := []byte(fmt.Sprintf(`"%s"`, strout))
	jsonout, _ := sig.MarshalJSON()
	assert.Equal(t, bytout, jsonout)

	// Unmarshal
	var sigout Signature

	sigout.UnmarshalJSON(bytout)
	assert.Equal(t, sigout, sig)

	// Value
	drvout, _ := sig.Value()
	assert.Equal(t, drvout.(string), strout)

	// Scan
	sigout = Signature{}
	sigout.Scan(strout)
	assert.Equal(t, sigout, sig)
}
