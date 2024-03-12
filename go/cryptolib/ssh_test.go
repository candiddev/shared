package cryptolib

import (
	"strings"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"golang.org/x/crypto/ssh"
)

func TestSSHKey(t *testing.T) {
	tests := []Algorithm{
		AlgorithmECP256,
		AlgorithmEd25519,
		AlgorithmRSA2048,
	}

	for _, test := range tests {
		t.Run(string(test), func(t *testing.T) {
			prv, pub, _ := NewKeysAsymmetric(test)
			prv.ID = ""
			pub.ID = ""

			b, err := KeyToSSH(prv)
			assert.HasErr(t, err, nil)
			prvOut, err := SSHToKey[KeyProviderPrivate](b)
			assert.HasErr(t, err, nil)
			assert.Equal(t, prvOut, prv)

			b, err = KeyToSSH(pub)
			assert.HasErr(t, err, nil)
			pubOut, err := SSHToKey[KeyProviderPublic](b)
			assert.HasErr(t, err, nil)
			assert.Equal(t, pubOut, pub)
		})
	}
}

func TestSSHSign(t *testing.T) {
	prv, pub, _ := NewKeysAsymmetric(AlgorithmBest)

	cert, err := SSHSign(prv, pub, SSHSignOpts{
		CriticalOptions: map[string]string{
			"force-command": "/bin/bash",
		},
		Extensions: map[string]string{
			"permit-port-forwarding": "",
			"permit-pty":             "",
		},
		KeyID:          "hello",
		TypeHost:       true,
		ValidBeforeSec: 60,
		ValidPrincipals: []string{
			"root",
		},
	})
	assert.HasErr(t, err, nil)
	assert.Equal(t, strings.Contains(string(cert), "-cert-"), true)

	p, _, _, _, err := ssh.ParseAuthorizedKey(cert) //nolint:dogsled
	assert.HasErr(t, err, nil)

	c := p.(*ssh.Certificate) //nolint:revive

	assert.Equal(t, c.CertType, ssh.HostCert)
}
