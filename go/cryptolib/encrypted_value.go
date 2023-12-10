package cryptolib

import (
	"database/sql/driver"
	"fmt"
	"strconv"
	"strings"

	"github.com/candiddev/shared/go/types"
)

// Encryption is the type of encryption.
type Encryption string

const (
	EncryptionBest           Encryption = "best"
	BestEncryptionAsymmetric            = Encryption(KDFECDHX25519)
	BestEncryptionSymmetric             = EncryptionChaCha20Poly1305
)

var (
	EncryptionAsymmetric = []string{ //nolint:gochecknoglobals
		string(EncryptionBest),
		string(KDFECDHP256),
		string(KDFECDHX25519),
	}
	EncryptionSymmetric = []string{ //nolint:gochecknoglobals
		string(EncryptionBest),
		string(EncryptionAES128GCM),
		string(EncryptionChaCha20Poly1305),
	}
)

// KDF is a Key Derivation Function.
type KDF string

// EncryptedValue is a decoded encrypted value.
type EncryptedValue struct {
	Ciphertext string
	Encryption Encryption
	KeyID      string
	KDF        KDF
	KDFInput   string
}

// ParseEncryptedValue turns a string into an EncryptedValue or error.
func ParseEncryptedValue(s string) (EncryptedValue, error) {
	v := EncryptedValue{}

	if r := strings.Split(s, "@"); len(r) == 2 {
		s = r[1]

		if k := strings.Split(r[0], ":"); len(k) == 2 {
			switch KDF(k[0]) {
			case KDFArgon2ID:
				v.KDF = KDFArgon2ID
			case KDFECDHX25519:
				v.KDF = KDFECDHX25519
			case KDFECDHP256:
				v.KDF = KDFECDHP256
			}

			if v.KDF == "" {
				return v, ErrUnknownKDF
			}

			v.KDFInput = k[1]
		}
	}

	if r := strings.Split(s, ":"); len(r) == 2 || len(r) == 3 {
		switch Encryption(r[0]) { //nolint:exhaustive
		case EncryptionNone:
			v.Encryption = EncryptionNone
		case EncryptionAES128GCM:
			v.Encryption = EncryptionAES128GCM
		case EncryptionChaCha20Poly1305:
			v.Encryption = EncryptionChaCha20Poly1305
		case EncryptionRSA2048OAEPSHA256:
			v.Encryption = EncryptionRSA2048OAEPSHA256
		}

		if v.Encryption != "" {
			v.Ciphertext = r[1]

			if len(r) == 3 {
				v.KeyID = r[2]
			}

			return v, nil
		}
	}

	return EncryptedValue{}, ErrUnknownEncryption
}

// Decrypt is a generic way to decrypt a value from a list of keys.
func (e EncryptedValue) Decrypt(keys []KeyProvider) ([]byte, error) {
	var err error

	var match bool

	var out []byte

	// Handle KDFs right away
	if e.KDF != "" {
		// Decrypt PBKDFs
		if e.KDF == KDFArgon2ID {
			match = true
			out, err = DecryptKDF(Argon2ID, e)
		} else {
			// Iterate keys
			for i := range keys {
				// If the key can be used as a KDF, the KDF type matches the EV (we could check KeyID stuff here, but this lets us test all available keys.  Could be inefficient, but better UX if the KeyID is changed...)
				if d, ok := keys[i].(KeyProviderDecryptKDF); ok {
					out, err = DecryptKDF(d, e)

					// End loop if we decrypted it
					if len(out) > 0 {
						match = true

						break
					}
				}
			}
		}
	} else {
		// For everything else...
		for i := range keys {
			// If the key provides encryption, try decrypting
			if keys[i].Provides(e.Encryption) {
				switch t := keys[i].(type) {
				case KeyProviderDecryptAsymmetric:
					out, err = t.DecryptAsymmetric(e)
				case KeyProviderEncryptSymmetric:
					out, err = t.DecryptSymmetric(e)
				}
			}

			// End loop if we decrypted it
			if len(out) > 0 {
				match = true

				break
			}
		}
	}

	if !match && err == nil {
		err = ErrDecryptingKey
	}

	return out, err
}

func (e EncryptedValue) ErrUnsupportedDecrypt() error {
	return fmt.Errorf("%s: %w", e.Encryption, ErrUnsupportedDecrypt)
}

func (e EncryptedValue) MarshalJSON() ([]byte, error) {
	output := ""

	if e != (EncryptedValue{}) {
		output = strconv.Quote(e.String())
	}

	return []byte(output), nil
}

func (e *EncryptedValue) String() string {
	o := fmt.Sprintf("%s:%s:%s", e.Encryption, e.Ciphertext, e.KeyID)

	if e.KDF != "" {
		o = fmt.Sprintf("%s:%s@%s", e.KDF, e.KDFInput, o)
	}

	return o
}

func (e *EncryptedValue) UnmarshalJSON(data []byte) error {
	var err error

	s, err := strconv.Unquote(string(data))
	if err != nil {
		return err
	}

	*e, err = ParseEncryptedValue(s)

	return err
}

func (e EncryptedValue) Value() (driver.Value, error) {
	if e.Encryption == "" {
		return "", nil
	}

	return e.String(), nil
}

func (e *EncryptedValue) Scan(src any) error {
	var err error

	if src != nil {
		*e, err = ParseEncryptedValue(src.(string))
	}

	return err
}

// EncryptedValues is multiple EncryptedValue.
type EncryptedValues []EncryptedValue

func (e EncryptedValues) SliceString() types.SliceString {
	s := types.SliceString{}

	for i := range e {
		s = append(s, e[i].String())
	}

	return s
}

func (e EncryptedValues) MarshalJSON() ([]byte, error) {
	return e.SliceString().MarshalJSON()
}

func (e EncryptedValues) Value() (driver.Value, error) {
	return e.SliceString().Value()
}

func (e *EncryptedValues) Scan(src any) error {
	if src != nil {
		source := string(src.([]byte))
		if source != "" && source != "{}" && source != "{NULL}" {
			output := strings.TrimRight(strings.TrimLeft(source, "{"), "}")
			array := strings.Split(output, ",")

			slice := EncryptedValues{}

			for i := range array {
				var s string

				if array[i] != `""` && array[i][0] == '"' {
					s = array[i][1 : len(array[i])-1]
				} else {
					s = array[i]
				}

				v, err := ParseEncryptedValue(s)
				if err != nil {
					return err
				}

				slice = append(slice, v)
			}

			*e = slice

			return nil
		}
	}

	*e = EncryptedValues{}

	return nil
}
