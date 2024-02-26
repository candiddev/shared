package cryptolib

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestPEMKey(t *testing.T) {
	prv1, pub1, _ := NewKeysAsymmetric(AlgorithmRSA2048)

	p := KeyToPEM(prv1)

	prv2, err := PEMToKey[KeyProviderPrivate](p)
	prv1.ID = ""

	assert.Equal(t, err, nil)
	assert.Equal(t, prv2, prv1)

	p = KeyToPEM(pub1)

	pub2, err := PEMToKey[KeyProviderPublic](p)
	pub1.ID = ""

	assert.Equal(t, err, nil)
	assert.Equal(t, pub2, pub1)

	_, err = PEMToKey[RSA2048PrivateKey](p)
	assert.HasErr(t, err, ErrParsingPEM)
}
