package cryptolib

import (
	"crypto"
	"database/sql/driver"
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"
)

type SignatureHash string

func (s SignatureHash) getHash() (crypto.Hash, error) {
	switch s {
	case SignatureHashSHA256:
		return crypto.SHA256, nil
	case SignatureHashEd25519:
		return 0, nil
	}

	return 0, fmt.Errorf("%w: %s", ErrUnknownHash, s)
}

const (
	BestSignatureHash SignatureHash = SignatureHashSHA256
)

type Signature struct {
	Hash      SignatureHash
	KeyID     string
	Signature []byte
}

func NewSignature(k Key[KeyProviderPrivate], message []byte) (Signature, error) {
	var hash SignatureHash

	switch k.Key.Algorithm() { //nolint:exhaustive
	case AlgorithmEd25519Private:
		hash = SignatureHashEd25519
	default:
		hash = SignatureHashSHA256
	}

	s := Signature{
		Hash:  hash,
		KeyID: k.ID,
	}

	h, err := hash.getHash()
	if err != nil {
		return s, err
	}

	sig, err := k.Key.Sign(message, h)
	if err != nil {
		return s, err
	}

	s.Signature = sig

	return s, nil
}

func ParseSignature(s string) (Signature, error) {
	sig := Signature{}

	if r := strings.Split(s, ":"); len(r) == 3 {
		b, err := base64.StdEncoding.DecodeString(r[1])
		if err != nil {
			return sig, fmt.Errorf("%w: %w", ErrUnknownSignature, err)
		}

		switch SignatureHash(r[0]) {
		case SignatureHashEd25519:
			sig.Hash = SignatureHashEd25519
		case SignatureHashSHA256:
			sig.Hash = SignatureHashSHA256
		default:
			return sig, fmt.Errorf("%w: %s", ErrUnknownHash, r[0])
		}

		sig.Signature = b
		sig.KeyID = r[2]

		return sig, nil
	}

	return sig, ErrUnknownSignature
}

func (s Signature) MarshalJSON() ([]byte, error) {
	output := ""

	if s.Signature != nil {
		output = strconv.Quote(s.String())
	}

	return []byte(output), nil
}

func (s *Signature) String() string {
	sig := base64.StdEncoding.EncodeToString(s.Signature)
	o := fmt.Sprintf("%s:%s:%s", s.Hash, sig, s.KeyID)

	return o
}

func (s *Signature) UnmarshalJSON(data []byte) error {
	var err error

	sig, err := strconv.Unquote(string(data))
	if err != nil {
		return err
	}

	*s, err = ParseSignature(sig)

	return err
}

func (s Signature) Value() (driver.Value, error) {
	if s.Signature == nil {
		return "", nil
	}

	return s.String(), nil
}

func (s Signature) Verify(message []byte, keys Keys[KeyProviderPublic]) error {
	h, err := s.Hash.getHash()
	if err != nil {
		return err
	}

	for k := range keys {
		if err := keys[k].Key.Verify(message, h, s.Signature); err == nil {
			return nil
		}
	}

	return ErrVerify
}

func (s *Signature) Scan(src any) error {
	var err error

	if src != nil {
		*s, err = ParseSignature(src.(string))
	}

	return err
}
