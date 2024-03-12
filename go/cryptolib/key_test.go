package cryptolib

import (
	"fmt"
	"strconv"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestNewKeyEncryptSymmetric(t *testing.T) {
	k, err := NewKeySymmetric(AlgorithmBest)
	assert.HasErr(t, err, nil)
	assert.Equal(t, k.Key.Algorithm(), AlgorithmChaCha20)
}

func TestNewKeyEncryptAsymmetric(t *testing.T) {
	prv, pub, err := NewKeysAsymmetric(AlgorithmBest)
	assert.HasErr(t, err, nil)
	assert.Equal(t, prv.Key.Algorithm(), AlgorithmEd25519Private)
	assert.Equal(t, pub.Key.Algorithm(), AlgorithmEd25519Public)
}

func TestParseKey(t *testing.T) {
	aes, _ := NewKeySymmetric(AlgorithmBest)

	k, err := ParseKey[KeyProviderSymmetric](aes.String())
	assert.HasErr(t, err, nil)
	assert.Equal(t, k.ID, aes.ID)
	assert.Equal(t, k.String(), aes.String())

	_, err = ParseKey[KeyProviderPrivate](aes.String())
	assert.HasErr(t, err, ErrParseKeyNotImplemented)

	_, err = ParseKey[KeyProviderSymmetric]("hello!")
	assert.HasErr(t, err, ErrParseKeyUnknown)

	prv, _, _ := NewKeysAsymmetric(BestEncryptionAsymmetric)

	pro, err := ParseKey[KeyProviderPrivate](string(KeyToPEM(prv)))
	assert.HasErr(t, err, nil)
	assert.Equal(t, prv.Key, pro.Key)
}

func TestKey(t *testing.T) {
	aes, _ := NewKeySymmetric(AlgorithmBest)

	j, err := aes.MarshalText()
	assert.HasErr(t, err, nil)
	assert.Equal(t, string(j), aes.String())

	assert.Equal(t, aes.String(), fmt.Sprintf("%s:%s:%s", aes.Key.Algorithm(), aes.Key, aes.ID))

	k := Key[KeyProviderSymmetric]{}
	k.UnmarshalText(j)
	assert.Equal(t, k, aes)
}

func TestKeys(t *testing.T) {
	_, pub1, _ := NewKeysAsymmetric(AlgorithmBest)
	_, pub2, _ := NewKeysAsymmetric(AlgorithmBest)

	k := Keys[KeyProviderPublic]{
		pub1,
		pub2,
	}

	bytout := []byte(fmt.Sprintf(`["%s","%s"]`, pub1.String(), pub2.String()))
	jsonout, _ := k.MarshalJSON()
	assert.Equal(t, jsonout, bytout)

	vout := []byte(fmt.Sprintf(`{%s,%s}`, pub1.String(), pub2.String()))
	valout, _ := k.Value()
	assert.Equal(t, valout.([]byte), vout)

	var kout Keys[KeyProviderPublic]

	kout.Scan(vout)

	assert.Equal(t, kout, k)

	k = Keys[KeyProviderPublic]{}
	assert.HasErr(t, k.UnmarshalJSON([]byte(strconv.Quote(pub1.String()))), nil)
	assert.Equal(t, k, Keys[KeyProviderPublic]{
		pub1,
	})

	k = Keys[KeyProviderPublic]{}
	assert.HasErr(t, k.UnmarshalJSON(jsonout), nil)
	assert.Equal(t, k, Keys[KeyProviderPublic]{
		pub1,
		pub2,
	})
}
