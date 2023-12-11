package cryptolib

import (
	"bytes"
	"fmt"
)

const BestKDF KDF = KDFArgon2ID

var (
	ValidPBKDF = []string{ //nolint:gochecknoglobals
		"best",
		string(KDFArgon2ID),
	}
)

func KDFGet(k KeyProviderKDFGet, input EncryptedValue) ([]byte, error) {
	v, err := k.KDFGet(input.KDFInput, input.KeyID)
	if err != nil {
		return nil, err
	}

	var key KeyProviderSymmetric

	switch input.Encryption { //nolint:exhaustive
	case EncryptionAES128GCM:
		key, err = NewAES128Key(bytes.NewReader(v))
	case EncryptionChaCha20Poly1305:
		key, err = NewChaCha20Key(bytes.NewReader(v))
	case EncryptionRSA2048OAEPSHA256:
		fallthrough
	case EncryptionNone:
		fallthrough
	default:
		err = fmt.Errorf("%w: %s", ErrUnknownKDFEncryption, input.Encryption)
	}

	if err != nil {
		return nil, err
	}

	return key.DecryptSymmetric(input)
}

func KDFSet(k KeyProviderKDFSet, keyID string, value []byte, e Encryption) (EncryptedValue, error) {
	v := EncryptedValue{}

	i, key, err := k.KDFSet()
	if err != nil {
		return v, err
	}

	if key == nil {
		return v, err
	}

	var ke KeyProviderSymmetric

	switch e { //nolint:exhaustive
	case EncryptionAES128GCM:
		ke, err = NewAES128Key(bytes.NewReader(key))
	case EncryptionBest:
		fallthrough
	case EncryptionChaCha20Poly1305:
		ke, err = NewChaCha20Key(bytes.NewReader(key))
	case EncryptionRSA2048OAEPSHA256:
		fallthrough
	case EncryptionNone:
		fallthrough
	default:
		err = fmt.Errorf("%w: %s", ErrUnknownKDFEncryption, e)
	}

	if err != nil {
		return v, err
	}

	v, err = ke.EncryptSymmetric(value, keyID)
	if err != nil {
		return v, err
	}

	v.KDF = k.KDF()
	v.KDFInput = i

	return v, nil
}
