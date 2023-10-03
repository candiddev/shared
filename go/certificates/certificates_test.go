package certificates

import (
	"bytes"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestGetBase64(t *testing.T) {
	cIn, err := GetSelfSigned("testing")
	assert.HasErr(t, err, nil)

	certPem := bytes.Buffer{}
	pem.Encode(&certPem, &pem.Block{
		Type:  "CERTIFICATE",
		Bytes: cIn.Certificate[0],
	})

	certB := base64.StdEncoding.EncodeToString(certPem.Bytes())

	keyPem := bytes.Buffer{}
	pem.Encode(&keyPem, &pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(cIn.PrivateKey.(*rsa.PrivateKey)),
	})

	keyB := base64.StdEncoding.EncodeToString(keyPem.Bytes())

	cOut, err := GetBase64(certB, keyB)

	assert.HasErr(t, err, nil)
	assert.Equal(t, cOut, cIn)
}

func TestGetSelfSigned(t *testing.T) {
	c, err := GetSelfSigned("testing")
	assert.HasErr(t, err, nil)

	cr, err := x509.ParseCertificate(c.Certificate[0])
	assert.HasErr(t, err, nil)

	assert.Equal(t, cr.Subject.CommonName, "testing")
}
