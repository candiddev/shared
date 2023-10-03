// Package certificates contains functions for generating TLS certificates.
package certificates

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/base64"
	"fmt"
	"math/big"
	"time"
)

// GetBase64 returns a certificate from a base64 certificate and private key.
func GetBase64(certificate string, key string) (tls.Certificate, error) {
	c, err := base64.StdEncoding.DecodeString(certificate)
	if err != nil {
		return tls.Certificate{}, fmt.Errorf("error base64 decoding certificate: %w", err)
	}

	k, err := base64.StdEncoding.DecodeString(key)
	if err != nil {
		return tls.Certificate{}, fmt.Errorf("error base64 decoding key: %w", err)
	}

	return tls.X509KeyPair(c, k)
}

// GetSelfSigned returns a self signed certificate valid for one year based on the provided commonName.
func GetSelfSigned(commonName string) (tls.Certificate, error) {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return tls.Certificate{}, fmt.Errorf("error generating key: %w", err)
	}

	t := time.Now()

	csr := &x509.Certificate{
		BasicConstraintsValid: true,
		ExtKeyUsage: []x509.ExtKeyUsage{
			x509.ExtKeyUsageServerAuth,
		},
		KeyUsage:     x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign,
		IsCA:         true,
		NotBefore:    t,
		NotAfter:     t.Add(time.Hour * 24 * 364),
		SerialNumber: big.NewInt(t.Unix()),
		Subject: pkix.Name{
			CommonName: commonName,
		},
	}

	cert, err := x509.CreateCertificate(rand.Reader, csr, csr, key.Public(), key)
	if err != nil {
		return tls.Certificate{}, fmt.Errorf("error generating certificate: %w", err)
	}

	return tls.Certificate{
		Certificate: append(tls.Certificate{}.Certificate, cert),
		PrivateKey:  key,
	}, nil
}
