package cryptolib

import (
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"strings"
)

func PEMToKey[T KeyProvider](b []byte) (Key[T], error) {
	d, _ := pem.Decode(b)
	if d == nil {
		return Key[T]{}, ErrParsingPEM
	}

	var err error

	var pk any

	switch d.Type {
	case "CERTIFICATE":
		kp := X509Certificate(base64.StdEncoding.EncodeToString(d.Bytes))
		if k, ok := any(kp).(T); ok {
			return Key[T]{
				ID:  d.Headers["id"],
				Key: k,
			}, nil
		} else {
			return Key[T]{}, fmt.Errorf("unsupported PEM type: %s does not provide type", d.Type)
		}
	case "PRIVATE KEY":
		pk, err = x509.ParsePKCS8PrivateKey(d.Bytes)
	case "PUBLIC KEY":
		pk, err = x509.ParsePKIXPublicKey(d.Bytes)
	default:
		return Key[T]{}, fmt.Errorf("unrecognized PEM type: %s", d.Type)
	}

	if err != nil {
		return Key[T]{}, fmt.Errorf("%w: %w", ErrParsingPEM, err)
	}

	return ParseType[T](pk, d.Headers["id"])
}

func pemWidth(s string) string {
	b := strings.Builder{}

	for i, r := range s {
		if i%64 == 0 {
			b.WriteString("\n")
		}

		b.WriteRune(r)
	}

	return b.String()
}

// KeyToPEM converts a KeyProvider to PEM.
func KeyToPEM[T KeyProvider](k Key[T]) []byte {
	var t string

	switch k.Key.Algorithm() { //nolint:exhaustive
	case AlgorithmECP256Private:
		fallthrough
	case AlgorithmEd25519Private:
		fallthrough
	case AlgorithmRSA2048Private:
		t = "PRIVATE KEY"
	case AlgorithmECP256Public:
		fallthrough
	case AlgorithmEd25519Public:
		fallthrough
	case AlgorithmRSA2048Public:
		t = "PUBLIC KEY"
	case AlgorithmX509Certificate:
		t = "CERTIFICATE"
	}

	return []byte(fmt.Sprintf("-----BEGIN %s-----\n%s\n-----END %s-----\n", t, pemWidth(fmt.Sprint(k.Key)), t))
}
