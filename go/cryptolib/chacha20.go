package cryptolib

import (
	"crypto/cipher"
	"encoding/base64"
	"fmt"
	"io"
	"sync"

	"golang.org/x/crypto/chacha20poly1305"
)

// ChaCha20Key is a key used for ChaCha20 encryption.
type ChaCha20Key string

const (
	AlgorithmChaCha20          Algorithm  = "chacha20"
	EncryptionChaCha20Poly1305 Encryption = "x" + Encryption(AlgorithmChaCha20) + "poly1305"
)

var chaCha20Keys = struct { //nolint: gochecknoglobals
	keys  map[ChaCha20Key]cipher.AEAD
	mutex sync.Mutex
}{
	keys: map[ChaCha20Key]cipher.AEAD{},
}

// NewChaCha20Key generates a new ChaCha20 key from a reader (like rand.reader) or an error.
func NewChaCha20Key(src io.Reader) (ChaCha20Key, error) {
	key := make([]byte, chacha20poly1305.KeySize)

	if _, err := io.ReadFull(src, key); err != nil {
		return "", fmt.Errorf("%w: %w", ErrGeneratingKey, err)
	}

	return ChaCha20Key(base64.StdEncoding.EncodeToString(key)), nil
}

func (ChaCha20Key) Algorithm() Algorithm {
	return AlgorithmChaCha20
}

func (k ChaCha20Key) DecryptSymmetric(v EncryptedValue) ([]byte, error) {
	if v.Encryption == EncryptionChaCha20Poly1305 {
		b, err := base64.StdEncoding.DecodeString(v.Ciphertext)
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrDecodingValue, err)
		}

		return k.DecryptPoly1305(b)
	}

	return nil, v.ErrUnsupportedDecrypt()
}

func (k ChaCha20Key) DecryptPoly1305(value []byte) ([]byte, error) {
	b, err := k.Key()
	if err != nil {
		return nil, err
	}

	return AEADDecrypt(b, value)
}

func (k ChaCha20Key) EncryptSymmetric(value []byte, keyID string) (EncryptedValue, error) {
	v, err := k.EncryptPoly1308(value)

	return EncryptedValue{
		Ciphertext: base64.StdEncoding.EncodeToString(v),
		Encryption: EncryptionChaCha20Poly1305,
		KeyID:      keyID,
	}, err
}

func (k ChaCha20Key) EncryptPoly1308(value []byte) ([]byte, error) {
	b, err := k.Key()
	if err != nil {
		return nil, err
	}

	return AEADEncrypt(b, value)
}

func (k ChaCha20Key) Key() (cipher.AEAD, error) {
	chaCha20Keys.mutex.Lock()

	defer chaCha20Keys.mutex.Unlock()

	var ok bool

	var a cipher.AEAD

	if a, ok = chaCha20Keys.keys[k]; !ok {
		bytesKey, err := base64.StdEncoding.DecodeString(string(k))
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrDecodingKey, err)
		}

		a, err = chacha20poly1305.NewX(bytesKey)
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrCreatingCipher, err)
		}

		chaCha20Keys.keys[k] = a
	}

	return a, nil
}

func (ChaCha20Key) Provides(e Encryption) bool {
	return e == EncryptionChaCha20Poly1305
}
