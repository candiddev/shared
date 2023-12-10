package cryptolib

import (
	"crypto/rand"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"golang.org/x/crypto/chacha20poly1305"
)

func TestChaCha20(t *testing.T) {
	key, err := NewChaCha20Key(rand.Reader)
	assert.Equal(t, err, nil)
	assert.Equal(t, len(key), chacha20poly1305.NonceSizeX+20)

	input := []byte("testing")

	output, err := key.EncryptSymmetric(input, "123")
	assert.Equal(t, err, nil)
	assert.Equal(t, len(output.Ciphertext), chacha20poly1305.NonceSizeX+40)
	assert.Equal(t, output.Encryption, EncryptionChaCha20Poly1305)
	assert.Equal(t, output.KeyID, "123")

	out, err := key.DecryptSymmetric(output)
	assert.Equal(t, err, nil)
	assert.Equal(t, out, input)
}
