package cryptolib

import (
	"crypto/rand"
	"math"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestAES256(t *testing.T) {
	key, err := NewAES256Key(rand.Reader)
	assert.Equal(t, err, nil)
	assert.Equal(t, len(key), 44)

	input := []byte("testing")

	output, err := key.EncryptSymmetric(input, "123")
	assert.Equal(t, err, nil)
	assert.Equal(t, len(output.Ciphertext), int(math.Ceil((float64(len(input))+12+4+12)/3)*4)) // IV + counter + append IV
	assert.Equal(t, output.Encryption, EncryptionAES256GCM)
	assert.Equal(t, output.KeyID, "123")

	out, err := key.DecryptSymmetric(output)
	assert.Equal(t, err, nil)
	assert.Equal(t, out, input)
}
