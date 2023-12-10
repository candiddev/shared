package cryptolib

import (
	"context"
	"crypto"
	"crypto/rand"
	"database/sql/driver"
	"encoding/gob"
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/candiddev/shared/go/cli"
	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/logger"
	"github.com/candiddev/shared/go/types"
)

// Algorithm is the type of key.
type Algorithm string

// AlgorithmBest will select he best Algorithm.
const AlgorithmBest Algorithm = "best"

var ErrParseKeyUnknown = errors.New("unknown key format")
var ErrParseKeyNotImplemented = errors.New("key cannot be used for the required operation")

func newID() string {
	return types.RandString(10)
}

func init() { //nolint:gochecknoinits
	gob.Register(AES128Key(""))
	gob.Register(ECP256PrivateKey(""))
	gob.Register(ECP256PublicKey(""))
	gob.Register(Ed25519PrivateKey(""))
	gob.Register(Ed25519PublicKey(""))
	gob.Register(RSA2048PrivateKey(""))
	gob.Register(RSA2048PublicKey(""))
}

// Key is a generic KeyProvider.
type Key[T KeyProvider] struct {
	ID  string
	Key T
}

// KeyProvider is something that can be a key.
type KeyProvider interface {
	Algorithm() Algorithm
	Provides(e Encryption) bool
}

// KeyProviderDecryptAsymmetric is a key that decrypts asymmetrically.
type KeyProviderDecryptAsymmetric interface {
	DecryptAsymmetric(input EncryptedValue) (output []byte, err error)
	Sign(message []byte, hash crypto.Hash) (signature []byte, err error)
	KeyProvider
}

// KeyProviderDecryptKDF is a key used for decrypting a KDF with existing inputs.
type KeyProviderDecryptKDF interface {
	KDF() KDF
	DecryptKDF(input, keyID string) (key []byte, err error)
	KeyProvider
}

// KeyProviderEncryptAsymmetric is a key that encrypts asymmetrically.
type KeyProviderEncryptAsymmetric interface {
	EncryptAsymmetric(input []byte, keyID string, encryption Encryption) (output EncryptedValue, err error)
	Verify(message []byte, hash crypto.Hash, signature []byte) (err error)
	KeyProvider
}

// KeyProviderEncryptKDF is a key that creates a new KDF.
type KeyProviderEncryptKDF interface {
	KDF() KDF
	EncryptKDF() (input string, key []byte, err error)
	KeyProvider
}

// KeyProviderEncryptSymmetric is a key that encrypts symmetrically.
type KeyProviderEncryptSymmetric interface {
	DecryptSymmetric(input EncryptedValue) (output []byte, err error)
	EncryptSymmetric(input []byte, keyID string) (output EncryptedValue, err error)
	KeyProvider
}

// GenerateKeys is a helper function for CLI apps to generate crypto keys.
func GenerateKeys[T cli.AppConfig[any]]() cli.Command[T] {
	return cli.Command[T]{
		ArgumentsRequired: []string{
			"encrypt-asymmetric, encrypt-symmetric, sign-verify",
		},
		ArgumentsOptional: []string{
			"name",
			"algorithm, default: best",
		},
		Name: "generate-keys",
		Run: func(ctx context.Context, args []string, c T) errs.Err {
			m := map[string]string{}

			a := EncryptionBest
			n := newID()

			if len(args) > 2 {
				n = args[2]
			}

			if len(args) > 3 {
				a = Encryption(args[2])
			}

			var k string

			var pu string

			switch args[1] {
			case "encrypt-symmetric":
				key, err := NewKeyEncryptSymmetric(a)
				if err != nil {
					return logger.Error(ctx, errs.ErrReceiver.Wrap(err))
				}

				key.ID = n

				k = key.String()
			case "encrypt-asymmetric":
				fallthrough
			case "sign-verify":
				prv, pub, err := NewKeysEncryptAsymmetric(a)
				if err != nil {
					return logger.Error(ctx, errs.ErrReceiver.Wrap(err))
				}

				prv.ID = n
				pub.ID = n
				k = prv.String()
				pu = pub.String()
			}

			v, err := EncryptKDF(Argon2ID, n, []byte(k), EncryptionBest)
			if err != nil {
				return logger.Error(ctx, errs.ErrReceiver.Wrap(err))
			}

			if v.Ciphertext != "" {
				k = v.String()
			}

			if pu == "" {
				m["key"] = k
			} else {
				m["privateKey"] = k
				m["publicKey"] = pu
			}

			return cli.Print(m)
		},
		Usage: "Generate cryptographic keys",
	}
}

// ParseKey turns a string into a Key or error.
func ParseKey[T KeyProvider](s string) (Key[T], error) {
	var k Key[T]

	var kp KeyProvider

	if r := strings.Split(s, ":"); len(r) == 2 || len(r) == 3 {
		switch Algorithm(r[0]) { //nolint:exhaustive
		case AlgorithmAES128:
			kp = AES128Key(r[1])
		case AlgorithmChaCha20:
			kp = ChaCha20Key(r[1])
		case AlgorithmECP256Private:
			kp = ECP256PrivateKey(r[1])
		case AlgorithmECP256Public:
			kp = ECP256PublicKey(r[1])
		case AlgorithmEd25519Private:
			kp = Ed25519PrivateKey(r[1])
		case AlgorithmEd25519Public:
			kp = Ed25519PublicKey(r[1])
		case AlgorithmRSA2048Private:
			kp = RSA2048PrivateKey(r[1])
		case AlgorithmRSA2048Public:
			kp = RSA2048PublicKey(r[1])
		case AlgorithmNone:
			kp = None(r[1])
		}

		a, ok := any(kp).(T)
		if !ok {
			return k, fmt.Errorf("%w: %v", ErrParseKeyNotImplemented, reflect.TypeOf(k))
		}

		k.Key = a

		if len(r) == 3 {
			k.ID = r[2]
		}

		return k, nil
	}

	return k, fmt.Errorf("%w: %s", ErrParseKeyUnknown, s)
}

// IsNil returns whether the key is nil.
func (k Key[T]) IsNil() bool {
	return any(k.Key) == nil
}

func (k *Key[T]) Scan(src any) error {
	return k.UnmarshalText([]byte(src.(string)))
}

func (k Key[T]) MarshalText() ([]byte, error) {
	return []byte(k.String()), nil
}

func (k Key[T]) String() string {
	if k.IsNil() {
		return ""
	}

	o := fmt.Sprintf("%s:%v", k.Key.Algorithm(), k.Key)
	if k.ID != "" {
		o += ":" + k.ID
	}

	return o
}

func (k Key[T]) Value() (driver.Value, error) {
	return k.MarshalText()
}

func (k *Key[T]) UnmarshalText(data []byte) error {
	var err error

	if len(data) == 0 {
		return nil
	}

	*k, err = ParseKey[T](string(data))

	return err
}

func NewKeysEncryptAsymmetric(e Encryption) (Key[KeyProviderDecryptAsymmetric], Key[KeyProviderEncryptAsymmetric], error) {
	var prv KeyProviderDecryptAsymmetric

	var pub KeyProviderEncryptAsymmetric

	var err error

	switch e { //nolint:exhaustive
	case EncryptionBest:
		fallthrough
	case Encryption(KDFECDHX25519):
		prv, pub, err = NewEd25519()
	case Encryption(KDFECDHP256):
		prv, pub, err = NewECP256()
	case EncryptionRSA2048OAEPSHA256:
		prv, pub, err = NewRSA2048()
	default:
		err = fmt.Errorf("%w: valid values are ed25519, ecp256, and rsa2048", ErrUnknownAlgorithm)
	}

	id := newID()

	return Key[KeyProviderDecryptAsymmetric]{
			ID:  id,
			Key: prv,
		},
		Key[KeyProviderEncryptAsymmetric]{
			ID:  id,
			Key: pub,
		}, err
}
func NewKeyEncryptSymmetric(e Encryption) (Key[KeyProviderEncryptSymmetric], error) {
	var k KeyProviderEncryptSymmetric

	var err error

	switch e { //nolint:exhaustive
	case EncryptionAES128GCM:
		k, err = NewAES128Key(rand.Reader)
	case EncryptionBest:
		fallthrough
	case EncryptionChaCha20Poly1305:
		k, err = NewChaCha20Key(rand.Reader)
	default:
		err = fmt.Errorf("%w: valid values are aes128 and chacha20", ErrUnknownAlgorithm)
	}

	return Key[KeyProviderEncryptSymmetric]{
		ID:  types.RandString(10),
		Key: k,
	}, err
}
