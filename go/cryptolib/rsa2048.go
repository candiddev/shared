package cryptolib

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"fmt"
	"sync"
)

const (
	AlgorithmRSA2048            Algorithm  = "rsa2048"
	AlgorithmRSA2048Private     Algorithm  = "rsa2048private"
	AlgorithmRSA2048Public      Algorithm  = "rsa2048public"
	EncryptionRSA2048OAEPSHA256 Encryption = "rsa2048oaepsha256"
)

// RSA2048PrivateKey is a private key type.
type RSA2048PrivateKey string

// RSA2048PublicKey is a public key type.
type RSA2048PublicKey string

var rsa2048PrivateKeys = struct { //nolint: gochecknoglobals
	keys  map[RSA2048PrivateKey]*rsa.PrivateKey
	mutex sync.Mutex
}{
	keys: map[RSA2048PrivateKey]*rsa.PrivateKey{},
}

var rsa2048PublicKeys = struct { //nolint: gochecknoglobals
	keys  map[RSA2048PublicKey]*rsa.PublicKey
	mutex sync.Mutex
}{
	keys: map[RSA2048PublicKey]*rsa.PublicKey{},
}

// NewRSA2048 generates an RSA private and public key.
func NewRSA2048() (privateKey RSA2048PrivateKey, publicKey RSA2048PublicKey, err error) {
	rsaPrivate, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return "", "", fmt.Errorf("%w: %w", ErrGeneratingPrivateKey, err)
	}

	x509Private, err := x509.MarshalPKCS8PrivateKey(rsaPrivate)
	if err != nil {
		return "", "", fmt.Errorf("%w: %w", ErrMarshalingPrivateKey, err)
	}

	x509Public, err := x509.MarshalPKIXPublicKey(&rsaPrivate.PublicKey)
	if err != nil {
		return "", "", fmt.Errorf("%w: %w", ErrMarshalingPublicKey, err)
	}

	return RSA2048PrivateKey(base64.StdEncoding.EncodeToString(x509Private)), RSA2048PublicKey(base64.StdEncoding.EncodeToString(x509Public)),
		nil
}

func (RSA2048PrivateKey) Algorithm() Algorithm {
	return AlgorithmRSA2048Private
}

func (r RSA2048PrivateKey) DecryptAsymmetric(input EncryptedValue) ([]byte, error) {
	if input.Encryption == EncryptionRSA2048OAEPSHA256 {
		b, err := base64.StdEncoding.DecodeString(input.Ciphertext)
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrDecodingValue, err)
		}

		return r.DecryptOAEPSHA256(b)
	}

	return nil, fmt.Errorf("%s: %w", input.Encryption, ErrUnsupportedDecrypt)
}

func (r RSA2048PrivateKey) DecryptOAEPSHA256(value []byte) ([]byte, error) {
	p, err := r.PrivateKey()
	if err != nil {
		return nil, err
	}

	out, err := rsa.DecryptOAEP(crypto.SHA256.New(), rand.Reader, p, value, nil)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrDecryptingPrivateKey, err)
	}

	return out, nil
}

func (r RSA2048PrivateKey) PrivateKey() (*rsa.PrivateKey, error) {
	rsa2048PrivateKeys.mutex.Lock()

	defer rsa2048PrivateKeys.mutex.Unlock()

	var ok bool

	var p *rsa.PrivateKey

	if p, ok = rsa2048PrivateKeys.keys[r]; !ok {
		bytesPrivate, err := base64.StdEncoding.DecodeString(string(r))
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrDecodingPrivateKey, err)
		}

		private, err := x509.ParsePKCS8PrivateKey(bytesPrivate)
		if err != nil {
			private, err = x509.ParsePKCS1PrivateKey(bytesPrivate)
			if err != nil {
				return nil, fmt.Errorf("%w: %w", ErrParsingPrivateKey, err)
			}
		}

		if p, ok = private.(*rsa.PrivateKey); !ok {
			return nil, ErrNoPrivateKey
		}

		rsa2048PrivateKeys.keys[r] = p
	}

	return p, nil
}

func (RSA2048PrivateKey) Provides(e Encryption) bool {
	return e == EncryptionRSA2048OAEPSHA256
}

func (r RSA2048PrivateKey) Sign(message []byte, hash crypto.Hash) (signature []byte, err error) {
	k, err := r.PrivateKey()
	if err != nil {
		return nil, err
	}

	n := hash.New()

	if _, err := n.Write(message); err != nil {
		return nil, fmt.Errorf("%w: %w", ErrCreatingHash, err)
	}

	sig, err := rsa.SignPKCS1v15(nil, k, hash, n.Sum(nil))
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrSign, err)
	}

	return sig, nil
}

func (RSA2048PublicKey) Algorithm() Algorithm {
	return AlgorithmRSA2048Public
}

func (r RSA2048PublicKey) PublicKey() (*rsa.PublicKey, error) {
	rsa2048PublicKeys.mutex.Lock()

	defer rsa2048PublicKeys.mutex.Unlock()

	var ok bool

	var p *rsa.PublicKey

	if p, ok = rsa2048PublicKeys.keys[r]; !ok {
		bytesPublic, err := base64.StdEncoding.DecodeString(string(r))
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrDecodingPublicKey, err)
		}

		public, err := x509.ParsePKIXPublicKey(bytesPublic)
		if err != nil {
			public, err = x509.ParsePKCS1PublicKey(bytesPublic)
			if err != nil {
				return nil, fmt.Errorf("%w: %w", ErrParsingPublicKey, err)
			}
		}

		if p, ok = public.(*rsa.PublicKey); !ok {
			return nil, ErrNoPublicKey
		}

		rsa2048PublicKeys.keys[r] = p
	}

	return p, nil
}

func (r RSA2048PublicKey) EncryptAsymmetric(value []byte, keyID string, _ Encryption) (EncryptedValue, error) {
	v, err := r.EncryptOAEPSHA256(value)

	return EncryptedValue{
		Ciphertext: base64.StdEncoding.EncodeToString(v),
		Encryption: EncryptionRSA2048OAEPSHA256,
		KeyID:      keyID,
	}, err
}

func (r RSA2048PublicKey) EncryptOAEPSHA256(value []byte) ([]byte, error) {
	p, err := r.PublicKey()
	if err != nil {
		return nil, err
	}

	out, err := rsa.EncryptOAEP(crypto.SHA256.New(), rand.Reader, p, value, nil)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrEncryptingPublicKey, err)
	}

	return out, nil
}

func (RSA2048PublicKey) Provides(e Encryption) bool {
	return e == EncryptionRSA2048OAEPSHA256
}

func (r RSA2048PublicKey) Verify(message []byte, hash crypto.Hash, signature []byte) error {
	k, err := r.PublicKey()
	if err != nil {
		return err
	}

	n := hash.New()

	if _, err := n.Write(message); err != nil {
		return fmt.Errorf("%w: %w", ErrCreatingHash, err)
	}

	if err := rsa.VerifyPKCS1v15(k, hash, n.Sum(nil), signature); err != nil {
		return fmt.Errorf("%w: %w", ErrVerify, err)
	}

	return nil
}
