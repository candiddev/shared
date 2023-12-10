package cryptolib

import (
	"crypto"
	"crypto/ecdh"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/x509"
	"encoding/base64"
	"fmt"
	"math/big"
	"sync"
)

const (
	AlgorithmECP256        Algorithm = "ecp256"
	AlgorithmECP256Private Algorithm = "ecp256private"
	AlgorithmECP256Public  Algorithm = "ecp256public"
	KDFECDHP256            KDF       = "ecdhp256"
	ecp256publicRawLen               = 65
	ecp256privateRawLen              = 32
)

// ECP256PrivateKey is a private key type.
type ECP256PrivateKey string

// ECP256PublicKey is a public key type.
type ECP256PublicKey string

var ecp256PrivateKeys = struct { //nolint: gochecknoglobals
	keys  map[ECP256PrivateKey]*ecdsa.PrivateKey
	mutex sync.Mutex
}{
	keys: map[ECP256PrivateKey]*ecdsa.PrivateKey{},
}

var ecp256PublicKeys = struct { //nolint: gochecknoglobals
	keys  map[ECP256PublicKey]*ecdsa.PublicKey
	mutex sync.Mutex
}{
	keys: map[ECP256PublicKey]*ecdsa.PublicKey{},
}

// NewECP256 generates a new ECP256 private/public keypair.
func NewECP256() (privateKey ECP256PrivateKey, publicKey ECP256PublicKey, err error) {
	private, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return "", "", fmt.Errorf("%w: %w", ErrGeneratingPrivateKey, err)
	}

	x509Private, err := x509.MarshalPKCS8PrivateKey(private)
	if err != nil {
		return "", "", fmt.Errorf("%w: %w", ErrMarshalingPrivateKey, err)
	}

	x509Public, err := x509.MarshalPKIXPublicKey(&private.PublicKey)
	if err != nil {
		return "", "", fmt.Errorf("%w: %w", ErrMarshalingPublicKey, err)
	}

	return ECP256PrivateKey(base64.StdEncoding.EncodeToString(x509Private)),
		ECP256PublicKey(base64.StdEncoding.EncodeToString(x509Public)),
		nil
}

func (ECP256PrivateKey) Algorithm() Algorithm {
	return AlgorithmECP256Private
}

func (e ECP256PrivateKey) DecryptAsymmetric(input EncryptedValue) ([]byte, error) {
	return DecryptKDF(e, input)
}

func (e ECP256PrivateKey) DecryptKDF(input, _ string) (key []byte, err error) {
	pub := ECP256PublicKey(input)

	pubE, err := pub.PublicKeyECDH()
	if err != nil {
		return nil, err
	}

	prvE, err := e.PrivateKeyECDH()
	if err != nil {
		return nil, err
	}

	k, err := prvE.ECDH(pubE)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrGeneratingKDF, err)
	}

	return k, nil
}

func (ECP256PrivateKey) KDF() KDF {
	return KDFECDHP256
}

func (e ECP256PrivateKey) PrivateKey() (*ecdsa.PrivateKey, error) {
	ecp256PrivateKeys.mutex.Lock()

	defer ecp256PrivateKeys.mutex.Unlock()

	var ok bool

	var p *ecdsa.PrivateKey

	if p, ok = ecp256PrivateKeys.keys[e]; !ok {
		bytesPrivate, err := base64.StdEncoding.DecodeString(string(e))
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrDecodingPrivateKey, err)
		}

		if len(bytesPrivate) == ecp256privateRawLen {
			ep, err := ecdh.P256().NewPrivateKey(bytesPrivate)
			if err != nil {
				return nil, fmt.Errorf("%w: %w", ErrParsingPrivateKey, err)
			}

			bytesPrivate, err = x509.MarshalPKCS8PrivateKey(ep)
			if err != nil {
				return nil, fmt.Errorf("%w: %w", ErrParsingPrivateKey, err)
			}
		}

		private, err := x509.ParsePKCS8PrivateKey(bytesPrivate)
		if err != nil {
			private, err = x509.ParseECPrivateKey(bytesPrivate)
			if err != nil {
				return nil, fmt.Errorf("%w: %w", ErrParsingPrivateKey, err)
			}
		}

		if p, ok = private.(*ecdsa.PrivateKey); !ok {
			return nil, ErrNoPrivateKey
		}

		ecp256PrivateKeys.keys[e] = p
	}

	return p, nil
}

func (e ECP256PrivateKey) PrivateKeyECDH() (*ecdh.PrivateKey, error) {
	p, err := e.PrivateKey()
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrParsingPrivateKey, err)
	}

	pe, err := p.ECDH()
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrParsingPrivateKey, err)
	}

	return pe, nil
}

func (e ECP256PrivateKey) Sign(message []byte, hash crypto.Hash) (signature []byte, err error) {
	k, err := e.PrivateKey()
	if err != nil {
		return nil, err
	}

	n := hash.New()

	if _, err := n.Write(message); err != nil {
		return nil, fmt.Errorf("%w: %w", ErrCreatingHash, err)
	}

	r, s, err := ecdsa.Sign(rand.Reader, k, n.Sum(nil))
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrSign, err)
	}

	out := make([]byte, 2*32)
	r.FillBytes(out[0:32])
	s.FillBytes(out[32:])

	return out, nil
}

func (ECP256PrivateKey) Provides(Encryption) bool {
	return false
}

func (ECP256PublicKey) Algorithm() Algorithm {
	return AlgorithmECP256Public
}

func (e ECP256PublicKey) EncryptAsymmetric(input []byte, keyID string, encryption Encryption) (EncryptedValue, error) {
	return EncryptKDF(e, keyID, input, encryption)
}

func (ECP256PublicKey) KDF() KDF {
	return KDFECDHP256
}

func (e ECP256PublicKey) EncryptKDF() (input string, key []byte, err error) {
	pubE, err := e.PublicKeyECDH()
	if err != nil {
		return "", nil, err
	}

	prv, pub, err := NewECP256()
	if err != nil {
		return "", nil, err
	}

	prvE, err := prv.PrivateKeyECDH()
	if err != nil {
		return "", nil, err
	}

	key, err = prvE.ECDH(pubE)
	if err != nil {
		return "", nil, fmt.Errorf("%w: %w", ErrGeneratingKDF, err)
	}

	return string(pub), key, nil
}

func (ECP256PublicKey) Provides(Encryption) bool {
	return false
}

func (e ECP256PublicKey) PublicKey() (*ecdsa.PublicKey, error) {
	ecp256PublicKeys.mutex.Lock()

	defer ecp256PublicKeys.mutex.Unlock()

	var ok bool

	var p *ecdsa.PublicKey

	if p, ok = ecp256PublicKeys.keys[e]; !ok {
		bytesPublic, err := base64.StdEncoding.DecodeString(string(e))
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrDecodingPublicKey, err)
		}

		if len(bytesPublic) == ecp256publicRawLen {
			ep, err := ecdh.P256().NewPublicKey(bytesPublic)
			if err != nil {
				return nil, fmt.Errorf("%w: %w", ErrParsingPublicKey, err)
			}

			bytesPublic, err = x509.MarshalPKIXPublicKey(ep)
			if err != nil {
				return nil, fmt.Errorf("%w: %w", ErrParsingPublicKey, err)
			}
		}

		public, err := x509.ParsePKIXPublicKey(bytesPublic)
		if err != nil {
			return nil, fmt.Errorf("%w: %w", ErrParsingPublicKey, err)
		}

		if p, ok = public.(*ecdsa.PublicKey); !ok {
			return nil, ErrNoPublicKey
		}

		ecp256PublicKeys.keys[e] = p
	}

	return p, nil
}

func (e ECP256PublicKey) PublicKeyECDH() (*ecdh.PublicKey, error) {
	p, err := e.PublicKey()
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrParsingPublicKey, err)
	}

	pe, err := p.ECDH()
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrParsingPublicKey, err)
	}

	return pe, nil
}

func (e ECP256PublicKey) Verify(message []byte, hash crypto.Hash, signature []byte) error {
	k, err := e.PublicKey()
	if err != nil {
		return err
	}

	n := hash.New()

	if _, err := n.Write(message); err != nil {
		return fmt.Errorf("%w: %w", ErrCreatingHash, err)
	}

	r := big.NewInt(0).SetBytes(signature[:32])
	s := big.NewInt(0).SetBytes(signature[32:])

	if !ecdsa.Verify(k, n.Sum(nil), r, s) {
		return ErrVerify
	}

	return nil
}
