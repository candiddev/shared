package cryptolib

import (
	"crypto/cipher"
	"crypto/rand"
	"errors"
	"fmt"
	"io"
)

var ErrCiphertextLength = errors.New("length of ciphertext is too short, probably invalid")

func AEADEncrypt(a cipher.AEAD, value []byte) ([]byte, error) {
	nonce := make([]byte, a.NonceSize())

	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, fmt.Errorf("%w: %w", ErrGeneratingNonce, err)
	}

	output := a.Seal(nonce, nonce, value, nil)

	return output, nil
}

func AEADDecrypt(a cipher.AEAD, value []byte) ([]byte, error) {
	if len(value) < a.NonceSize()+1 {
		return nil, ErrCiphertextLength
	}

	out, err := a.Open(nil, value[:a.NonceSize()], value[a.NonceSize():], nil)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrDecryptingKey, err)
	}

	return out, nil
}
