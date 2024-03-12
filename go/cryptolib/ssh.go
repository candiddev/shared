package cryptolib

import (
	"crypto"
	"crypto/ed25519"
	"crypto/rand"
	"encoding/pem"
	"errors"
	"fmt"
	"time"

	"github.com/candiddev/shared/go/cli"
	"golang.org/x/crypto/ssh"
)

// SSHSignOpts are options for SSH signing.
type SSHSignOpts struct {
	/* CriticalOptions to add to certificate */
	CriticalOptions map[string]string

	/* Extensions to add to certificate */
	Extensions map[string]string

	/* KeyID for certificate */
	KeyID string

	/* Certificate will be host type, otherwise defaults to user. */
	TypeHost bool

	/* ValidBeforeSec sets the expiration of the certificate.  If nil, will be set to 1 hour */
	ValidBeforeSec int

	/* ValidPrincipals for the certificate. */
	ValidPrincipals []string
}

func KeyToSSH[T KeyProvider](k Key[T]) ([]byte, error) {
	var b []byte

	var err error

	var prv crypto.PrivateKey

	switch k.Key.Algorithm() { //nolint:exhaustive
	case AlgorithmECP256Private:
		prv, err = any(k.Key).(ECP256PrivateKey).PrivateKey()

		fallthrough
	case AlgorithmEd25519Private:
		if prv == nil {
			prv, err = any(k.Key).(Ed25519PrivateKey).PrivateKey()
		}

		fallthrough
	case AlgorithmRSA2048Private:
		if prv == nil {
			prv, err = any(k.Key).(RSA2048PrivateKey).PrivateKey()
		}

		if err != nil {
			return nil, err
		}

		p, err := ssh.MarshalPrivateKey(prv, k.ID)
		if err != nil {
			return nil, fmt.Errorf("error marshaling private key: %w", err)
		}

		b = pem.EncodeToMemory(p)
	case AlgorithmECP256Public:
		fallthrough
	case AlgorithmEd25519Public:
		fallthrough
	case AlgorithmRSA2048Public:
		if k, ok := any(k.Key).(KeyProviderPublic); ok {
			pk, err := k.PublicKey()
			if err != nil {
				return nil, err
			}

			spk, err := ssh.NewPublicKey(pk)
			if err != nil {
				return nil, fmt.Errorf("error generating ssh public key: %w", err)
			}

			b = ssh.MarshalAuthorizedKey(spk)
		} else {
			return nil, errors.New("unknown public key format")
		}
	}

	return b, nil
}

func SSHToKey[T KeyProvider](b []byte) (Key[T], error) {
	var k Key[T]

	s, err := ssh.ParseRawPrivateKey(b)

	if errors.Is(err, &ssh.PassphraseMissingError{}) {
		var pass []byte

		pass, err = cli.Prompt("Password for SSH key:", "", true)
		if err != nil {
			return k, fmt.Errorf("%w: %w", ErrParsingSSH, err)
		}

		s, err = ssh.ParseRawPrivateKeyWithPassphrase(b, pass)
	}

	if err == nil {
		if a, ok := s.(*ed25519.PrivateKey); ok {
			if a != nil {
				s = *a
			}
		}

		return ParseType[T](s, "")
	}

	key, _, _, _, err := ssh.ParseAuthorizedKey(b) //nolint:dogsled
	if err != nil {
		return k, fmt.Errorf("%w: %w", ErrParsingSSH, err)
	}

	return ParseType[T](key.(ssh.CryptoPublicKey).CryptoPublicKey(), "")
}

func SSHSign(privateKey Key[KeyProviderPrivate], publicKey Key[KeyProviderPublic], opts SSHSignOpts) ([]byte, error) {
	k, err := publicKey.Key.PublicKey()
	if err != nil {
		return nil, err
	}

	pub, err := ssh.NewPublicKey(k)
	if err != nil {
		return nil, fmt.Errorf("error getting SSH public key: %w", err)
	}

	s, err := privateKey.Key.Signer()
	if err != nil {
		return nil, fmt.Errorf("error getting SSH CA key: %w", err)
	}

	prv, err := ssh.NewSignerFromKey(s)
	if err != nil {
		return nil, fmt.Errorf("error getting SSH signing key: %w", err)
	}

	certType := ssh.UserCert
	if opts.TypeHost {
		certType = ssh.HostCert
	}

	before := opts.ValidBeforeSec
	if before == 0 {
		before = 60 * 60
	}

	cert := ssh.Certificate{
		CertType:        uint32(certType),
		Key:             pub,
		KeyId:           opts.KeyID,
		ValidBefore:     uint64(time.Now().Add(time.Duration(before) * time.Second).Unix()),
		ValidPrincipals: opts.ValidPrincipals,
	}
	cert.Permissions.CriticalOptions = opts.CriticalOptions
	cert.Permissions.Extensions = opts.Extensions

	if err := cert.SignCert(rand.Reader, prv); err != nil {
		return nil, fmt.Errorf("error signing key: %w", err)
	}

	return ssh.MarshalAuthorizedKey(&cert), nil
}
