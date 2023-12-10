package cryptolib

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"fmt"
	"io"
	"sync"
)

// AES128Key is a key used for AES encryption.
type AES128Key string

const (
	AlgorithmAES128     Algorithm  = "aes128"
	EncryptionAES128GCM Encryption = Encryption(AlgorithmAES128) + "gcm"
)

var aesKeys = struct { //nolint: gochecknoglobals
	keys  map[AES128Key]cipher.AEAD
	mutex sync.Mutex
}{
	keys: map[AES128Key]cipher.AEAD{},
}

// NewAES128Key generates a new AES key from a reader (like rand.reader) or an error.
func NewAES128Key(src io.Reader) (AES128Key, error) {
	key := make([]byte, aes.BlockSize)

	if _, err := io.ReadFull(src, key); err != nil {
		return "", fmt.Errorf("%w: %w", ErrGeneratingKey, err)
	}

	return AES128Key(base64.StdEncoding.EncodeToString(key)), nil
}

func (AES128Key) Algorithm() Algorithm {
	return AlgorithmAES128
}

func (k AES128Key) DecryptSymmetric(v EncryptedValue) ([]byte, error) {
	if v.Encryption == EncryptionAES128GCM {
		b, err := base64.StdEncoding.DecodeString(v.Ciphertext)
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrDecodingValue, err)
		}

		return k.DecryptGCM(b)
	}

	return nil, v.ErrUnsupportedDecrypt()
}

func (k AES128Key) DecryptGCM(value []byte) ([]byte, error) {
	b, err := k.Key()
	if err != nil {
		return nil, err
	}

	return AEADDecrypt(b, value)
}

func (k AES128Key) EncryptSymmetric(value []byte, keyID string) (EncryptedValue, error) {
	v, err := k.EncryptGCM(value)

	return EncryptedValue{
		Ciphertext: base64.StdEncoding.EncodeToString(v),
		Encryption: EncryptionAES128GCM,
		KeyID:      keyID,
	}, err
}

func (k AES128Key) EncryptGCM(value []byte) ([]byte, error) {
	b, err := k.Key()
	if err != nil {
		return nil, err
	}

	return AEADEncrypt(b, value)
}

func (k AES128Key) Key() (cipher.AEAD, error) {
	aesKeys.mutex.Lock()

	defer aesKeys.mutex.Unlock()

	var ok bool

	var b cipher.AEAD

	if b, ok = aesKeys.keys[k]; !ok {
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

		aesKeys.keys[k] = b
	}

	return b, nil
}

func (AES128Key) Provides(e Encryption) bool {
	return e == EncryptionAES128GCM
}
