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

// KeyProviderSymmetric is a key that encrypts symmetrically.
type KeyProviderSymmetric interface {
	DecryptSymmetric(input EncryptedValue) (output []byte, err error)
	EncryptSymmetric(input []byte, keyID string) (output EncryptedValue, err error)
	KeyProvider
}

// KeyProviderKDFGet is a key used for retrieving a KDF with existing inputs.
type KeyProviderKDFGet interface {
	KDF() KDF
	KDFGet(input, keyID string) (key []byte, err error)
	KeyProvider
}

// KeyProviderKDFSet is a key that creates a new KDF.
type KeyProviderKDFSet interface {
	KDF() KDF
	KDFSet() (input string, key []byte, err error)
	KeyProvider
}

// KeyProviderPrivate is a private key.
type KeyProviderPrivate interface {
	DecryptAsymmetric(input EncryptedValue) (output []byte, err error)
	Sign(message []byte, hash crypto.Hash) (signature []byte, err error)
	KeyProvider
}

// KeyProviderPublic is a public key.
type KeyProviderPublic interface {
	EncryptAsymmetric(input []byte, keyID string, encryption Encryption) (output EncryptedValue, err error)
	Verify(message []byte, hash crypto.Hash, signature []byte) (err error)
	KeyProvider
}

// GenerateKeys is a helper function for CLI apps to generate crypto keys.
func GenerateKeys[T cli.AppConfig[any]](arg string) cli.Command[T] {
	var args []string

	if arg == "" {
		args = []string{"asymmetric, symmetric"}
	}

	return cli.Command[T]{
		ArgumentsRequired: args,
		ArgumentsOptional: []string{
			"name",
			"algorithm, default: best",
		},
		Name: "generate-keys",
		Run: func(ctx context.Context, args []string, c T) errs.Err {
			m := map[string]string{}

			a := AlgorithmBest
			n := newID()

			if arg == "" {
				arg = args[1]

				if len(args) > 2 {
					n = args[2]
				}

				if len(args) > 3 {
					a = Algorithm(args[3])
				}
			} else {
				if len(args) > 1 {
					n = args[1]
				}

				if len(args) > 2 {
					a = Algorithm(args[2])
				}
			}

			var k string

			var pu string

			switch arg {
			case "asymmetric":
				prv, pub, err := NewKeysEncryptAsymmetric(a)
				if err != nil {
					return logger.Error(ctx, errs.ErrReceiver.Wrap(err))
				}

				prv.ID = n
				pub.ID = n
				k = prv.String()
				pu = pub.String()
			case "symmetric":
				key, err := NewKeyEncryptSymmetric(a)
				if err != nil {
					return logger.Error(ctx, errs.ErrReceiver.Wrap(err))
				}

				key.ID = n

				k = key.String()
			}

			v, err := KDFSet(Argon2ID, n, []byte(k), EncryptionBest)
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

func NewKeysEncryptAsymmetric(a Algorithm) (Key[KeyProviderPrivate], Key[KeyProviderPublic], error) {
	var prv KeyProviderPrivate

	var pub KeyProviderPublic

	var err error

	switch a { //nolint:exhaustive
	case AlgorithmBest:
		fallthrough
	case AlgorithmEd25519:
		prv, pub, err = NewEd25519()
	case AlgorithmECP256:
		prv, pub, err = NewECP256()
	case AlgorithmRSA2048:
		prv, pub, err = NewRSA2048()
	default:
		err = fmt.Errorf("%w: valid values are ed25519, ecp256, and rsa2048", ErrUnknownAlgorithm)
	}

	id := newID()

	return Key[KeyProviderPrivate]{
			ID:  id,
			Key: prv,
		},
		Key[KeyProviderPublic]{
			ID:  id,
			Key: pub,
		}, err
}
func NewKeyEncryptSymmetric(a Algorithm) (Key[KeyProviderSymmetric], error) {
	var k KeyProviderSymmetric

	var err error

	switch a { //nolint:exhaustive
	case AlgorithmAES128:
		k, err = NewAES128Key(rand.Reader)
	case AlgorithmBest:
		fallthrough
	case AlgorithmChaCha20:
		k, err = NewChaCha20Key(rand.Reader)
	default:
		err = fmt.Errorf("%w: valid values are aes128 and chacha20", ErrUnknownAlgorithm)
	}

	return Key[KeyProviderSymmetric]{
		ID:  types.RandString(10),
		Key: k,
	}, err
}

// Keys is multiple Key.
type Keys[T KeyProvider] []Key[T]

func (k Keys[T]) SliceString() types.SliceString {
	s := types.SliceString{}

	for i := range k {
		s = append(s, k[i].String())
	}

	return s
}

func (k Keys[T]) MarshalJSON() ([]byte, error) {
	return k.SliceString().MarshalJSON()
}

func (k Keys[T]) Value() (driver.Value, error) {
	return k.SliceString().Value()
}

func (k *Keys[T]) Scan(src any) error { //nolint:revive
	if src != nil {
		source := string(src.([]byte))
		if source != "" && source != "{}" && source != "{NULL}" {
			output := strings.TrimRight(strings.TrimLeft(source, "{"), "}")
			array := strings.Split(output, ",")

			slice := Keys[T]{}

			for i := range array {
				var s string

				if array[i] != `""` && array[i][0] == '"' {
					s = array[i][1 : len(array[i])-1]
				} else {
					s = array[i]
				}

				v, err := ParseKey[T](s)
				if err != nil {
					return err
				}

				slice = append(slice, v)
			}

			*k = slice

			return nil
		}
	}

	*k = Keys[T]{}

	return nil
}
