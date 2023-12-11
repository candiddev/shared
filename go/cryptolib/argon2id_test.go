package cryptolib

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/cli"
	"github.com/candiddev/shared/go/logger"
)

func TestArgon2ID(t *testing.T) {
	logger.SetStd()

	v := []byte("test")
	p := "password123\npassword123\n"

	cli.SetStdin(p)

	v1, err := KDFSet(Argon2ID, "", v, EncryptionAES128GCM)
	assert.HasErr(t, err, nil)
	assert.Equal(t, v1.KDF, KDFArgon2ID)
	assert.Equal(t, v1.KDFInput != "", true)

	cli.SetStdin(p)

	out, err := KDFGet(Argon2ID, v1)
	assert.HasErr(t, err, nil)
	assert.Equal(t, out, v)

	cli.SetStdin("password1234\n")

	n, err := KDFGet(Argon2ID, v1)
	assert.HasErr(t, err, ErrDecryptingKey)
	assert.Equal(t, string(out) != string(n), true)
}
