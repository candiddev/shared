package cryptolib

import (
	"encoding/base64"
	"fmt"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestNewSignatureVerify(t *testing.T) {
	edprv, edpub, _ := NewKeysEncryptAsymmetric(Encryption(KDFECDHX25519))
	ecprv, ecpub, _ := NewKeysEncryptAsymmetric(Encryption(KDFECDHP256))
	rsprv, rspub, _ := NewKeysEncryptAsymmetric(EncryptionRSA2048OAEPSHA256)
	msg := []byte("hello world")
	tests := map[string]struct {
		sign          KeyProviderDecryptAsymmetric
		verify        KeyProviderEncryptAsymmetric
		wantSignErr   error
		wantVerifyErr error
	}{
		"ed25519": {
			sign:   edprv.Key,
			verify: edpub.Key,
		},
		"ecp256": {
			sign:   ecprv.Key,
			verify: ecpub.Key,
		},
		"rsa": {
			sign:   rsprv.Key,
			verify: rspub.Key,
		},
		"wrong": {
			sign:        Ed25519PrivateKey("hello"),
			verify:      rspub.Key,
			wantSignErr: ErrDecodingPrivateKey,
		},
		"mix": {
			sign:          ecprv.Key,
			verify:        rspub.Key,
			wantVerifyErr: ErrVerify,
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			sig, err := NewSignature(tc.sign, "123", msg)
			assert.HasErr(t, err, tc.wantSignErr)

			if tc.wantSignErr == nil {
				assert.HasErr(t, sig.Verify(msg, []KeyProviderEncryptAsymmetric{
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
	prv, _, _ := NewKeysEncryptAsymmetric(EncryptionBest)

	sig, _ := NewSignature(prv.Key, prv.ID, []byte("helloworld"))

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
