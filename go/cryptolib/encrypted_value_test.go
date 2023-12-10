package cryptolib

import (
	"fmt"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestParseEncryptedValue(t *testing.T) {
	tests := map[string]struct {
		err   error
		input Encryption
		want  string
	}{
		"None": {
			input: EncryptionNone + ":none",
			want:  "none:none:",
		},
		"AES128": {
			input: EncryptionAES128GCM + ":aes",
			want:  "aes128gcm:aes:",
		},
		"RSA2048": {
			input: EncryptionRSA2048OAEPSHA256 + ":rsa",
			want:  "rsa2048oaepsha256:rsa:",
		},
		"Unknown": {
			input: Encryption("unknown:unknown"),
			err:   ErrUnknownEncryption,
			want:  "::",
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			got, err := ParseEncryptedValue(string(tc.input))
			assert.Equal(t, err, tc.err)
			assert.Equal(t, got.String(), tc.want)
		})
	}
}

func TestEncryptedValue(t *testing.T) {
	ev := EncryptedValue{
		Ciphertext: "helloworld",
		Encryption: EncryptionNone,
	}

	// Marshal
	strout := fmt.Sprintf("%s:%s:%s", ev.Encryption, ev.Ciphertext, ev.KeyID)
	bytout := []byte(fmt.Sprintf(`"%s"`, strout))
	jsonout, _ := ev.MarshalJSON()
	assert.Equal(t, bytout, jsonout)

	// Unmarshal
	var evout EncryptedValue

	evout.UnmarshalJSON(bytout)
	assert.Equal(t, evout, ev)

	// Value
	drvout, _ := ev.Value()
	assert.Equal(t, drvout.(string), strout)

	// Scan
	evout = EncryptedValue{}
	evout.Scan(strout)
	assert.Equal(t, evout, ev)

	// Decrypt
	prv, pub, _ := NewKeysEncryptAsymmetric(EncryptionBest)
	k, _ := NewKeyEncryptSymmetric(EncryptionBest)
	keys := []KeyProvider{
		prv.Key,
		pub.Key,
		k.Key,
	}

	v := []byte("hello")

	ev, _ = k.Key.EncryptSymmetric(v, "")
	out, err := ev.Decrypt(keys)
	assert.HasErr(t, err, nil)
	assert.Equal(t, out, v)

	ev, _ = pub.Key.EncryptAsymmetric(v, "123", EncryptionAES128GCM)
	out, err = ev.Decrypt(keys)
	assert.HasErr(t, err, nil)
	assert.Equal(t, out, v)

	ev, _ = pub.Key.EncryptAsymmetric(v, "", EncryptionAES128GCM)
	_, err = ev.Decrypt(keys[:0])

	assert.HasErr(t, err, ErrDecryptingKey)
}

func TestEncryptedValues(t *testing.T) {
	ev := EncryptedValues{
		{
			Ciphertext: "test1",
			Encryption: EncryptionNone,
		},
		{
			Ciphertext: "test2",
			Encryption: EncryptionNone,
		},
	}

	bytout := []byte(`["none:test1:","none:test2:"]`)
	jsonout, _ := ev.MarshalJSON()
	assert.Equal(t, jsonout, bytout)

	vout := []byte("{none:test1:,none:test2:}")
	valout, _ := ev.Value()
	assert.Equal(t, valout.([]byte), vout)

	var evout EncryptedValues

	evout.Scan(vout)

	assert.Equal(t, evout, ev)
}
