package cryptolib

import (
	"context"
	"crypto"
	"crypto/rand"
	"database/sql/driver"
	"encoding/gob"
	"errors"
	"fmt"
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
	gob.Register(AES256Key(""))
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
	Signer() (crypto.Signer, error)
	Public() (KeyProviderPublic, error)
	KeyProvider
}

// KeyProviderPublic is a public key.
type KeyProviderPublic interface {
	EncryptAsymmetric(input []byte, keyID string, encryption Encryption) (output EncryptedValue, err error)
	PublicKey() (crypto.PublicKey, error)
	Verify(message []byte, hash crypto.Hash, signature []byte) (err error)
	KeyProvider
}

// GenerateKeys is a helper function for CLI apps to generate crypto keys.
func GenerateKeys[T cli.AppConfig[any]]() cli.Command[T] {
	return cli.Command[T]{
		ArgumentsOptional: []string{
			"name",
		},
		Flags: cli.Flags{
			"a": {
				Default:     []string{"best"},
				Placeholder: "algorithm",
				Usage:       "Algorithm to use for generating keys",
			},
		},
		Name: "generate-keys",
		Run: func(ctx context.Context, args []string, flag cli.Flags, c T) errs.Err {
			m := map[string]string{}

			a, _ := flag.Value("a")
			n := newID()

			if len(args) > 1 {
				n = args[1]
			}

			prv, pub, err := NewKeysAsymmetric(Algorithm(a))
			if err != nil {
				return logger.Error(ctx, errs.ErrReceiver.Wrap(err))
			}

			prv.ID = n
			pub.ID = n

			k := prv.String()

			v, err := KDFSet(Argon2ID, n, []byte(k), EncryptionBest)
			if err != nil {
				return logger.Error(ctx, errs.ErrReceiver.Wrap(err))
			}

			if v.Ciphertext != "" {
				k = v.String()
			}

			m["privateKey"] = k
			m["publicKey"] = pub.String()

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
		case AlgorithmAES256:
			kp = AES256Key(r[1])
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
		case AlgorithmX509Certificate:
			kp = X509Certificate(r[1])
		}

		a, ok := any(kp).(T)
		if !ok {
			return k, fmt.Errorf("%T %w: %T", kp, ErrParseKeyNotImplemented, k)
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

func NewKeySymmetric[T Algorithm | Encryption](t T) (Key[KeyProviderSymmetric], error) {
	var k KeyProviderSymmetric

	var err error

	switch string(t) {
	case string(AlgorithmAES128):
		fallthrough
	case string(EncryptionAES128GCM):
		k, err = NewAES128Key(rand.Reader)
	case string(AlgorithmAES256):
		fallthrough
	case string(EncryptionAES256GCM):
		k, err = NewAES256Key(rand.Reader)
	case string(AlgorithmBest):
		fallthrough
	case string(AlgorithmChaCha20):
		fallthrough
	case string(EncryptionChaCha20Poly1305):
		k, err = NewChaCha20Key(rand.Reader)
	default:
		err = fmt.Errorf("%w: valid values are [%s]", ErrUnknownAlgorithm, strings.Join([]string{
			string(AlgorithmBest),
			string(AlgorithmAES128),
			string(EncryptionAES128GCM),
			string(AlgorithmAES256),
			string(EncryptionAES256GCM),
			string(AlgorithmChaCha20),
			string(EncryptionChaCha20Poly1305),
		}, ", "))
	}

	return Key[KeyProviderSymmetric]{
		ID:  types.RandString(10),
		Key: k,
	}, err
}

func NewKeysAsymmetric[T Algorithm | Encryption](t T) (Key[KeyProviderPrivate], Key[KeyProviderPublic], error) {
	var prv KeyProviderPrivate

	var pub KeyProviderPublic

	var err error

	switch string(t) {
	case string(AlgorithmBest):
		fallthrough
	case string(AlgorithmEd25519):
		fallthrough
	case string(KDFECDHX25519):
		prv, pub, err = NewEd25519()
	case string(AlgorithmECP256):
		fallthrough
	case string(KDFECDHP256):
		prv, pub, err = NewECP256()
	case string(AlgorithmRSA2048):
		fallthrough
	case string(EncryptionRSA2048OAEPSHA256):
		prv, pub, err = NewRSA2048()
	default:
		err = fmt.Errorf("%w: valid values are [%s]", ErrUnknownAlgorithm, strings.Join([]string{
			string(AlgorithmBest),
			string(AlgorithmEd25519),
			string(KDFECDHX25519),
			string(AlgorithmECP256),
			string(KDFECDHP256),
			string(AlgorithmRSA2048),
			string(EncryptionRSA2048OAEPSHA256),
		}, ", "))
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

// Keys is multiple Key.
type Keys[T KeyProvider] []Key[T]

func (k Keys[T]) SliceString() types.SliceString {
	s := types.SliceString{}

	for i := range k {
		s = append(s, k[i].String())
	}

	return s
}

// Keys returns a slice of KeyProviders for use with Decrypt.
func (k Keys[T]) Keys() []KeyProvider {
	out := make([]KeyProvider, len(k))

	for i := range k {
		out[i] = k[i].Key
	}

	return out
}

func (k Keys[T]) MarshalJSON() ([]byte, error) {
	return k.SliceString().MarshalJSON()
}

func (k *Keys[T]) UnmarshalJSON(data []byte) error {
	s := types.SliceString{}
	if err := s.UnmarshalJSON(data); err != nil {
		return err
	}

	keys := Keys[T]{}

	for i := range s {
		v, err := ParseKey[T](s[i])
		if err != nil {
			return err
		}

		keys = append(keys, v)
	}

	*k = keys

	return nil
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
