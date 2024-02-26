package cryptolib

import (
	"crypto/x509"
	"testing"
	"time"

	"github.com/candiddev/shared/go/assert"
)

func TestNewCertificate(t *testing.T) {
	prv1, _, _ := NewKeysAsymmetric(BestEncryptionAsymmetric)

	x, err := NewX509Certificate(prv1, Key[KeyProviderPublic]{}, "Test CA", NewX509CertificateOpts{
		ExtKeyUsages: []string{
			"clientAuth",
			"serverAuth",
		},
		IsCA: true,
		KeyUsages: []string{
			"crlSign",
			"keyAgreement",
		},
	})

	assert.HasErr(t, err, nil)

	c, err := x.Key.Certificate()

	assert.HasErr(t, err, nil)

	assert.Equal(t, c.SerialNumber != nil, true)
	assert.Equal(t, c.NotAfter, c.NotBefore.Add(time.Hour*24*365).Round(time.Second))

	p := KeyToPEM(Key[KeyProvider]{
		Key: x.Key,
	})
	x2, err := PEMToKey[X509Certificate](p)

	assert.HasErr(t, err, nil)

	ca, err := x2.Key.Certificate()

	assert.HasErr(t, err, nil)

	assert.Equal(t, c.SerialNumber.String(), ca.SerialNumber.String())
	assert.Equal(t, c.Subject.String(), ca.Subject.String())
	assert.Equal(t, c.NotBefore, ca.NotBefore)
	assert.Equal(t, c.NotAfter, ca.NotAfter)
	assert.Equal(t, c.ExtKeyUsage, []x509.ExtKeyUsage{
		x509.ExtKeyUsageClientAuth,
		x509.ExtKeyUsageServerAuth,
	})
	assert.Equal(t, c.IsCA, true)
	assert.Equal(t, c.KeyUsage, x509.KeyUsageCRLSign|x509.KeyUsageCertSign|x509.KeyUsageKeyAgreement)

	prv2, pub2, _ := NewKeysAsymmetric(BestEncryptionAsymmetric)

	x, err = NewX509Certificate(prv1, pub2, "localhost", NewX509CertificateOpts{
		CACertificate: ca,
		DNSNames:      []string{"localhost"},
		IsCA:          true,
		IPAddresses: []string{
			"127.0.0.1",
		},
	})

	assert.HasErr(t, err, nil)

	ica, err := x.Key.Certificate()

	assert.HasErr(t, err, nil)
	assert.Equal(t, ica.Issuer.String(), "CN=Test CA")
	assert.Equal(t, ica.DNSNames, []string{"localhost"})
	assert.Equal(t, len(ica.IPAddresses), 1)
	assert.Equal(t, ica.IsCA, true)

	roots := x509.NewCertPool()
	roots.AddCert(ca)

	chain, err := ica.Verify(x509.VerifyOptions{
		Roots: roots,
	})
	assert.HasErr(t, err, nil)
	assert.Equal(t, len(chain[0]), 2)

	_, pub3, _ := NewKeysAsymmetric(BestEncryptionAsymmetric)
	x, err = NewX509Certificate(prv2, pub3, "localhost", NewX509CertificateOpts{
		CACertificate: ica,
	})

	assert.HasErr(t, err, nil)

	c, err = x.Key.Certificate()

	assert.HasErr(t, err, nil)
	assert.Equal(t, c.IsCA, false)

	intermediates := x509.NewCertPool()
	intermediates.AddCert(ica)

	chain, err = c.Verify(x509.VerifyOptions{
		Intermediates: intermediates,
		Roots:         roots,
	})
	assert.HasErr(t, err, nil)
	assert.Equal(t, len(chain[0]), 3)
}
