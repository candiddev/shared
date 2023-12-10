package cryptolib

import (
	"crypto/rand"
	"math"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestAES128(t *testing.T) {
	key, err := NewAES128Key(rand.Reader)
	assert.Equal(t, err, nil)
	assert.Equal(t, len(key), int(math.Ceil(float64(16)/3)*4))

	input := []byte("testing")

	output, err := key.EncryptSymmetric(input, "123")
	assert.Equal(t, err, nil)
	assert.Equal(t, len(output.Ciphertext), int(math.Ceil((float64(len(input))+12+4+12)/3)*4)) // IV + counter + append IV
	assert.Equal(t, output.Encryption, EncryptionAES128GCM)
	assert.Equal(t, output.KeyID, "123")

	out, err := key.DecryptSymmetric(output)
	assert.Equal(t, err, nil)
	assert.Equal(t, out, input)

	// Test JavaScript outputs
	key = AES128Key("lQQyBeRmGYECoYkafl+4VQ==")
	jsOutput, _ := ParseEncryptedValue(string(EncryptionAES128GCM) + ":Guqhksdu4nsd6FIrONsXnXyDl8wS78amak0uMZ49KJSly5w=")

	output, err = key.EncryptSymmetric(input, "")
	assert.Equal(t, err, nil)
	assert.Equal(t, len(output.Ciphertext), int(math.Ceil((float64(len(input))+12+4+12)/3)*4)) // IV + counter + append IV

	out, err = key.DecryptSymmetric(output)
	assert.Equal(t, err, nil)
	assert.Equal(t, out, input)

	out, err = key.DecryptSymmetric(jsOutput)
	assert.Equal(t, err, nil)
	assert.Equal(t, out, input)

	key = AES128Key("UMq4DaTgIjDxPMnjm1Ajyg==")
	o, err := key.DecryptSymmetric(EncryptedValue{
		Ciphertext: "qdM5dJdTphITLfsfm/qgrpuMG2pKg4LxMjcrfe7W85U=",
		Encryption: EncryptionAES128GCM,
	})
	assert.HasErr(t, err, nil)
	assert.Equal(t, string(o), "test")
}
