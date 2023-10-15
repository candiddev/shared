package cryptolib

import (
	"crypto"
	"crypto/ed25519"
	"crypto/rand"
	"crypto/x509"
	"encoding/base64"
	"fmt"
	"sync"
)

const (
	AlgorithmEd25519Private Algorithm = "ed25519private"
	AlgorithmEd25519Public  Algorithm = "ed25519public"
)

// Ed25519PrivateKey is a private key type.
type Ed25519PrivateKey string

// Ed25519PublicKey is a public key type.
type Ed25519PublicKey string

var ed25519PrivateKeys = struct { //nolint: gochecknoglobals
	keys  map[Ed25519PrivateKey]ed25519.PrivateKey
	mutex sync.Mutex
}{
	keys: map[Ed25519PrivateKey]ed25519.PrivateKey{},
}

var ed25519PublicKeys = struct { //nolint: gochecknoglobals
	keys  map[Ed25519PublicKey]ed25519.PublicKey
	mutex sync.Mutex
}{
	keys: map[Ed25519PublicKey]ed25519.PublicKey{},
}

// NewEd25519 generates a new Ed25519 private/public keypair.
func NewEd25519() (privateKey Ed25519PrivateKey, publicKey Ed25519PublicKey, err error) {
	public, private, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return "", "", fmt.Errorf("%w: %w", ErrGeneratingPrivateKey, err)
	}

	x509Private, err := x509.MarshalPKCS8PrivateKey(private)
	if err != nil {
		return "", "", fmt.Errorf("%w: %w", ErrMarshalingPrivateKey, err)
	}

	x509Public, err := x509.MarshalPKIXPublicKey(public)
	if err != nil {
		return "", "", fmt.Errorf("%w: %w", ErrMarshalingPublicKey, err)
	}

	return Ed25519PrivateKey(base64.StdEncoding.EncodeToString(x509Private)), Ed25519PublicKey(base64.StdEncoding.EncodeToString(x509Public)), nil
}

func (Ed25519PrivateKey) Algorithm() Algorithm {
	return AlgorithmEd25519Private
}

func (e Ed25519PrivateKey) PrivateKey() (ed25519.PrivateKey, error) {
	ed25519PrivateKeys.mutex.Lock()

	defer ed25519PrivateKeys.mutex.Unlock()

	var ok bool

	var p ed25519.PrivateKey

	if p, ok = ed25519PrivateKeys.keys[e]; !ok {
		bytesPrivate, err := base64.StdEncoding.DecodeString(string(e))
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrDecodingPrivateKey, err)
		}

		private, err := x509.ParsePKCS8PrivateKey(bytesPrivate)
		if err != nil {
			private, err = x509.ParseECPrivateKey(bytesPrivate)
			if err != nil {
				if len(bytesPrivate) != ed25519.PrivateKeySize {
					return nil, fmt.Errorf("%w: %w", ErrParsingPrivateKey, err)
				}

				private = ed25519.PrivateKey(bytesPrivate)
			}
		}

		if p, ok = private.(ed25519.PrivateKey); !ok {
			return nil, ErrNoPrivateKey
		}

		ed25519PrivateKeys.keys[e] = p
	}

	return p, nil
}

func (e Ed25519PrivateKey) Sign(message []byte, _ crypto.Hash) (signature []byte, err error) {
	k, err := e.PrivateKey()
	if err != nil {
		return nil, err
	}

	return ed25519.Sign(k, message), nil
}

func (Ed25519PublicKey) Algorithm() Algorithm {
	return AlgorithmEd25519Public
}

func (e Ed25519PublicKey) PublicKey() (ed25519.PublicKey, error) {
	ed25519PublicKeys.mutex.Lock()

	defer ed25519PublicKeys.mutex.Unlock()

	var ok bool

	var p ed25519.PublicKey

	if p, ok = ed25519PublicKeys.keys[e]; !ok {
		bytesPublic, err := base64.StdEncoding.DecodeString(string(e))
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrDecodingPublicKey, err)
		}

		public, err := x509.ParsePKIXPublicKey(bytesPublic)
		if err != nil {
			if len(bytesPublic) != ed25519.PublicKeySize {
				return nil, fmt.Errorf("%w: %w", ErrParsingPublicKey, err)
			}

			public = ed25519.PublicKey(bytesPublic)
		}

		if p, ok = public.(ed25519.PublicKey); !ok {
			return nil, ErrNoPublicKey
		}

		ed25519PublicKeys.keys[e] = p
	}

	return p, nil
}

func (e Ed25519PublicKey) Verify(message []byte, _ crypto.Hash, signature []byte) error {
	k, err := e.PublicKey()
	if err != nil {
		return err
	}

	if !ed25519.Verify(k, message, signature) {
		return ErrVerify
	}

	return nil
}
