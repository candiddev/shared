package cryptolib

import (
	"crypto/ecdsa"
	"crypto/ed25519"
	"crypto/rsa"
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

	var k KeyProvider

	switch d.Type {
	case "CERTIFICATE":
		k = X509Certificate(base64.StdEncoding.EncodeToString(d.Bytes))
	case "PRIVATE KEY":
		pk, err := x509.ParsePKCS8PrivateKey(d.Bytes)
		if err != nil {
			return Key[T]{}, fmt.Errorf("%w: %w", ErrParsingPEM, err)
		}

		switch pk.(type) {
		case *ecdsa.PrivateKey:
			k = ECP256PrivateKey(base64.StdEncoding.EncodeToString(d.Bytes))
		case ed25519.PrivateKey:
			k = Ed25519PrivateKey(base64.StdEncoding.EncodeToString(d.Bytes))
		case *rsa.PrivateKey:
			k = RSA2048PrivateKey(base64.StdEncoding.EncodeToString(d.Bytes))
		}
	case "PUBLIC KEY":
		pk, err := x509.ParsePKIXPublicKey(d.Bytes)
		if err != nil {
			return Key[T]{}, fmt.Errorf("%w: %w", ErrParsingPEM, err)
		}

		switch pk.(type) {
		case *ecdsa.PublicKey:
			k = ECP256PublicKey(base64.StdEncoding.EncodeToString(d.Bytes))
		case ed25519.PublicKey:
			k = Ed25519PublicKey(base64.StdEncoding.EncodeToString(d.Bytes))
		case *rsa.PublicKey:
			k = RSA2048PublicKey(base64.StdEncoding.EncodeToString(d.Bytes))
		}
	}

	t, ok := any(k).(T)
	if !ok {
		return Key[T]{}, fmt.Errorf("%w: unknown key type: %T", ErrParsingPEM, k)
	}

	id := ""
	if a, ok := d.Headers["id"]; ok {
		id = a
	}

	return Key[T]{
		ID:  id,
		Key: t,
	}, nil
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
