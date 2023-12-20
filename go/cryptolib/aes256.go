package cryptolib

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"fmt"
	"io"
	"sync"
)

// AES256Key is a key used for AES encryption.
type AES256Key string

const (
	AlgorithmAES256     Algorithm  = "aes256"
	EncryptionAES256GCM Encryption = Encryption(AlgorithmAES256) + "gcm"
)

var aes256Keys = struct { //nolint: gochecknoglobals
	keys  map[AES256Key]cipher.AEAD
	mutex sync.Mutex
}{
	keys: map[AES256Key]cipher.AEAD{},
}

// NewAES256Key generates a new AES key from a reader (like rand.reader) or an error.
func NewAES256Key(src io.Reader) (AES256Key, error) {
	key := make([]byte, aes.BlockSize*2)

	if _, err := io.ReadFull(src, key); err != nil {
		return "", fmt.Errorf("%w: %w", ErrGeneratingKey, err)
	}

	return AES256Key(base64.StdEncoding.EncodeToString(key)), nil
}

func (AES256Key) Algorithm() Algorithm {
	return AlgorithmAES256
}

func (k AES256Key) DecryptSymmetric(v EncryptedValue) ([]byte, error) {
	if v.Encryption == EncryptionAES256GCM {
		b, err := base64.StdEncoding.DecodeString(v.Ciphertext)
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrDecodingValue, err)
		}

		return k.DecryptGCM(b)
	}

	return nil, v.ErrUnsupportedDecrypt()
}

func (k AES256Key) DecryptGCM(value []byte) ([]byte, error) {
	b, err := k.Key()
	if err != nil {
		return nil, err
	}

	return AEADDecrypt(b, value)
}

func (k AES256Key) EncryptSymmetric(value []byte, keyID string) (EncryptedValue, error) {
	v, err := k.EncryptGCM(value)

	return EncryptedValue{
		Ciphertext: base64.StdEncoding.EncodeToString(v),
		Encryption: EncryptionAES256GCM,
		KeyID:      keyID,
	}, err
}

func (k AES256Key) EncryptGCM(value []byte) ([]byte, error) {
	b, err := k.Key()
	if err != nil {
		return nil, err
	}

	return AEADEncrypt(b, value)
}

func (k AES256Key) Key() (cipher.AEAD, error) {
	aes256Keys.mutex.Lock()

	defer aes256Keys.mutex.Unlock()

	var ok bool

	var b cipher.AEAD

	if b, ok = aes256Keys.keys[k]; !ok {
		bytesKey, err := base64.StdEncoding.DecodeString(string(k))
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrDecodingKey, err)
		}

		c, err := aes.NewCipher(bytesKey)
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrCreatingCipher, err)
		}

		b, err = cipher.NewGCM(c)
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrGeneratingGCM, err)
		}

		aes256Keys.keys[k] = b
	}

	return b, nil
}

func (AES256Key) Provides(e Encryption) bool {
	return e == EncryptionAES256GCM
}
