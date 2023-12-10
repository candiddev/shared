package cryptolib

import (
	"crypto"
	"crypto/ecdsa"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestECP256(t *testing.T) {
	prvStr, pubStr, err := NewECP256()

	assert.Equal(t, err, nil)

	badPrv1 := ECP256PrivateKey("asd")
	_, err = badPrv1.PrivateKey()
	assert.HasErr(t, err, ErrDecodingPrivateKey)

	badPrv2 := ECP256PrivateKey(pubStr)
	_, err = badPrv2.PrivateKey()
	assert.HasErr(t, err, ErrParsingPrivateKey)

	prvKey, err := prvStr.PrivateKey()
	assert.Equal(t, err, nil)
	assert.Equal(t, ed25519PrivateKeys.mutex.TryLock(), true)
	ed25519PrivateKeys.mutex.Unlock()
	assert.Equal(t, ecp256PrivateKeys.keys[prvStr], prvKey)
	assert.Equal(t, len(ecp256PrivateKeys.keys), 1)
	ecp256PrivateKeys.keys = map[ECP256PrivateKey]*ecdsa.PrivateKey{}

	badPub1 := ECP256PublicKey("asd")
	_, err = badPub1.PublicKey()
	assert.HasErr(t, err, ErrDecodingPublicKey)

	badPub2 := ECP256PublicKey(prvStr)
	_, err = badPub2.PublicKey()
	assert.HasErr(t, err, ErrParsingPublicKey)

	pubKey, err := pubStr.PublicKey()
	assert.Equal(t, err, nil)
	assert.Equal(t, len(ecp256PublicKeys.keys), 1)
	assert.Equal(t, ecp256PublicKeys.keys[pubStr], pubKey)
	ecp256PublicKeys.keys = map[ECP256PublicKey]*ecdsa.PublicKey{}

	// Sign/Verify
	m := []byte("hello")
	sig, err := prvStr.Sign(m, crypto.SHA256)
	assert.HasErr(t, err, nil)
	err = pubStr.Verify(m, crypto.SHA256, sig)
	assert.HasErr(t, err, nil)

	prvStr = ECP256PrivateKey("MHcCAQEEII8Ao3ONNjVV7sT7UmRuDKCmnSMGp1DFHv8TgfstDmlKoAoGCCqGSM49AwEHoUQDQgAEAGPkVUJDwjaJradHJQgcwfACHvthghIO73sBCCe7MbROFAsE94lCabtP2SX+pxTOMeIEhuuMrGQICkBWb+kw5Q==")
	pubStr = ECP256PublicKey("MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEAGPkVUJDwjaJradHJQgcwfACHvthghIO73sBCCe7MbROFAsE94lCabtP2SX+pxTOMeIEhuuMrGQICkBWb+kw5Q==")
	sig, err = prvStr.Sign(m, crypto.SHA256)
	assert.HasErr(t, err, nil)

	err = pubStr.Verify(m, crypto.SHA256, sig)
	assert.HasErr(t, err, nil)

	// ECDH
	_, err = prvStr.PrivateKeyECDH()
	assert.HasErr(t, err, nil)
	_, err = pubStr.PublicKeyECDH()
	assert.HasErr(t, err, nil)

	_, err = ECP256PublicKey("BMcTjbO2yd2L2pEldptdebVWB5YjPtmPlE2lSP8l6DpW/4V9eKp0nhC+/j3kTDLHMSx7Yh/s14fGVbX9wojw8xI=").PublicKeyECDH()
	assert.HasErr(t, err, nil)

	_, err = ECP256PrivateKey("HIOI1gk7T/rVrDkKmj1K3szf0HyGH0j4CdLA0ROIqHQ=").PrivateKeyECDH()
	assert.HasErr(t, err, nil)

	// KDF
	v := []byte("test")
	v1, err := pubStr.EncryptAsymmetric(v, "123", EncryptionAES128GCM)
	assert.HasErr(t, err, nil)
	assert.Equal(t, v1.KDF, KDFECDHP256)
	assert.Equal(t, v1.KDFInput != "", true)
	assert.Equal(t, v1.KeyID, "123")

	out, err := prvStr.DecryptAsymmetric(v1)
	assert.HasErr(t, err, nil)
	assert.Equal(t, out, v)

	v2, _ := pubStr.EncryptAsymmetric(v, "123", EncryptionAES128GCM)
	assert.Equal(t, v1.KDFInput != v2.KDFInput, true)

	prvStr, _, _ = NewECP256()

	_, err = prvStr.DecryptAsymmetric(v1)
	assert.HasErr(t, err, ErrDecryptingKey)
}
