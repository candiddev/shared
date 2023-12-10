package cryptolib

import "encoding/base64"

// None is not really a crypto provider.
type None string

const (
	AlgorithmNone  Algorithm  = "none"
	EncryptionNone Encryption = "none"
)

func (None) Algorithm() Algorithm {
	return AlgorithmNone
}

// EncryptSymmetric doesn't really encrypt.
func (None) EncryptSymmetric(value []byte, keyID string) (EncryptedValue, error) {
	return EncryptedValue{
		Ciphertext: base64.StdEncoding.EncodeToString(value),
		Encryption: EncryptionNone,
		KeyID:      keyID,
	}, nil
}

// DecryptSymmetric doesn't really decrypt.
func (None) DecryptSymmetric(value EncryptedValue) ([]byte, error) {
	return base64.StdEncoding.DecodeString(value.Ciphertext)
}

func (None) Provides(e Encryption) bool {
	return e == EncryptionNone
}
