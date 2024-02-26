package cryptolib

import (
	"crypto"
	"crypto/rand"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/base64"
	"fmt"
	"math/big"
	"net"
	"sort"
	"strings"
	"sync"
	"time"
)

const (
	AlgorithmX509Certificate Algorithm = "x509certificate"
)

var x509certificates = struct { //nolint: gochecknoglobals
	keys  map[X509Certificate]*x509.Certificate
	mutex sync.Mutex
}{
	keys: map[X509Certificate]*x509.Certificate{},
}

// X509Certificate is an X509 certificate.
type X509Certificate string

func (X509Certificate) Algorithm() Algorithm {
	return AlgorithmX509Certificate
}

func (x X509Certificate) Certificate() (*x509.Certificate, error) {
	x509certificates.mutex.Lock()

	defer x509certificates.mutex.Unlock()

	var ok bool

	var c *x509.Certificate

	if c, ok = x509certificates.keys[x]; !ok {
		b, err := base64.StdEncoding.DecodeString(string(x))
		if err != nil {
			return nil, fmt.Errorf("%w: %s", ErrDecodingCertificate, err)
		}

		c, err = x509.ParseCertificate(b)
		if err != nil {
			return nil, fmt.Errorf("%w: %s", ErrDecodingCertificate, err)
		}

		x509certificates.keys[x] = c
	}

	return c, nil
}

func (X509Certificate) Provides(Encryption) bool {
	return false
}

// NewX509CertificateOpts are optional values that can be set for a certificate.
type NewX509CertificateOpts struct {
	/* CACertificate, if specified will be used for signing.  Omitting it will create a self-signed certificate */
	CACertificate *x509.Certificate

	/* DNSNames are used to set DNS SANs */
	DNSNames []string

	/* ExtKeyUsages are allowed extended key usages. */
	ExtKeyUsages []string

	/* IPAddresses are used to set IP SANs */
	IPAddresses []string

	/* IsCA will toggle CA and CA usage flags */
	IsCA bool

	/* KeyUsages are allowed key usages. */
	KeyUsages []string

	/* NotAfter sets the expiration of the certificate.  If nil, will be set for 1 year */
	NotAfterSec int
}

var validX509ExtKeyUsages = map[string]x509.ExtKeyUsage{ //nolint:gochecknoglobals
	"clientAuth":                     x509.ExtKeyUsageClientAuth,
	"codeSigning":                    x509.ExtKeyUsageCodeSigning,
	"emailProtection":                x509.ExtKeyUsageEmailProtection,
	"ipsecEndSystem":                 x509.ExtKeyUsageIPSECEndSystem,
	"ipsecTunnel":                    x509.ExtKeyUsageIPSECTunnel,
	"ipsecUser":                      x509.ExtKeyUsageIPSECUser,
	"microsoftCommercialCodeSigning": x509.ExtKeyUsageMicrosoftCommercialCodeSigning,
	"microsoftKernelCodeSigning":     x509.ExtKeyUsageMicrosoftKernelCodeSigning,
	"microsoftServerGatedCrypto":     x509.ExtKeyUsageMicrosoftServerGatedCrypto,
	"netscapeServerGatedCrypto":      x509.ExtKeyUsageNetscapeServerGatedCrypto,
	"ocspSigning":                    x509.ExtKeyUsageOCSPSigning,
	"serverAuth":                     x509.ExtKeyUsageServerAuth,
	"timestamping":                   x509.ExtKeyUsageTimeStamping,
}

// ValidX509ExtKeyUsages returns a sorted list of valid external key usages.
func ValidX509ExtKeyUsages() []string {
	out := []string{}

	for k := range validX509ExtKeyUsages {
		out = append(out, k)
	}

	sort.Strings(out)

	return out
}

var validX509KeyUsages = map[string]x509.KeyUsage{ //nolint:gochecknoglobals
	"certSign":          x509.KeyUsageCertSign,
	"crlSign":           x509.KeyUsageCRLSign,
	"contentCommitment": x509.KeyUsageContentCommitment,
	"dataEncipherment":  x509.KeyUsageDataEncipherment,
	"digitalSignature":  x509.KeyUsageDigitalSignature,
	"decipherOnly":      x509.KeyUsageDecipherOnly,
	"encipherOnly":      x509.KeyUsageEncipherOnly,
	"keyAgreement":      x509.KeyUsageKeyAgreement,
	"keyEncipherment":   x509.KeyUsageKeyEncipherment,
}

// ValidX509KeyUsages returns a sorted list of valid key usages.
func ValidX509KeyUsages() []string {
	out := []string{}

	for k := range validX509KeyUsages {
		out = append(out, k)
	}

	sort.Strings(out)

	return out
}

// NewX509Certificate generates a new signed X509 certificate.  If certificatePublicKeyPEM is nil, the caPrivateKeyPEM public key will be used instead.  Can specify additional values in the certificate.  Returns an X509 and an error.
func NewX509Certificate(signingKey Key[KeyProviderPrivate], publicKey Key[KeyProviderPublic], commonName string, opts NewX509CertificateOpts) (Key[X509Certificate], error) {
	serialNumberLimit := new(big.Int).Lsh(big.NewInt(1), 128)

	serialNumber, err := rand.Int(rand.Reader, serialNumberLimit)
	if err != nil {
		return Key[X509Certificate]{}, fmt.Errorf("%w: %w", ErrGeneratingSerialNumber, err)
	}

	nb := time.Now().Add(-1 * time.Second).Round(time.Second)

	after := opts.NotAfterSec
	if after == 0 {
		after = 60 * 60 * 24 * 365
	}

	ips := []net.IP{}
	for i := range opts.IPAddresses {
		ips = append(ips, net.ParseIP(opts.IPAddresses[i]))
	}

	issuer := pkix.Name{}
	if opts.CACertificate != nil {
		issuer = opts.CACertificate.Subject
	}

	extUsage := []x509.ExtKeyUsage{}

	if len(opts.ExtKeyUsages) > 0 {
		for i := range opts.ExtKeyUsages {
			if v, ok := validX509ExtKeyUsages[opts.ExtKeyUsages[i]]; ok { //nolint:revive
				extUsage = append(extUsage, v)
			} else {
				return Key[X509Certificate]{}, fmt.Errorf("unrecognized extended key usage: %s, valid values: %s", opts.ExtKeyUsages[i], strings.Join(ValidX509ExtKeyUsages(), ","))
			}
		}
	}

	var usage x509.KeyUsage

	if len(opts.KeyUsages) > 0 {
		for i := range opts.KeyUsages {
			if v, ok := validX509KeyUsages[opts.KeyUsages[i]]; ok { //nolint:revive
				usage |= v
			} else {
				return Key[X509Certificate]{}, fmt.Errorf("unrecognized key usage: %s", opts.ExtKeyUsages[i])
			}
		}
	}

	c := x509.Certificate{
		BasicConstraintsValid: true,
		DNSNames:              opts.DNSNames,
		ExtKeyUsage:           extUsage,
		Issuer:                issuer,
		IPAddresses:           ips,
		NotAfter:              nb.Add(time.Second * time.Duration(after)).Round(time.Second),
		NotBefore:             nb,
		KeyUsage:              usage,
		SerialNumber:          serialNumber,
		Subject: pkix.Name{
			CommonName: commonName,
		},
	}

	if opts.IsCA {
		c.IsCA = true
		c.KeyUsage |= x509.KeyUsageCertSign | x509.KeyUsageCRLSign
	}

	ca := opts.CACertificate
	if ca == nil {
		ca = &c
	}

	var pub crypto.PublicKey

	if publicKey.IsNil() {
		var pu KeyProviderPublic

		publicKey.ID = signingKey.ID

		pu, err = signingKey.Key.Public()
		if err != nil {
			return Key[X509Certificate]{}, fmt.Errorf("%w: %w", ErrCreatingCertificate, err)
		}

		pub, err = pu.PublicKey()
	} else {
		pub, err = publicKey.Key.PublicKey()
	}

	if err != nil {
		return Key[X509Certificate]{}, fmt.Errorf("%w: %w", ErrCreatingCertificate, err)
	}

	prv, err := signingKey.Key.Signer()
	if err != nil {
		return Key[X509Certificate]{}, fmt.Errorf("%w: %w", ErrCreatingCertificate, err)
	}

	d, err := x509.CreateCertificate(rand.Reader, &c, ca, pub, prv)
	if err != nil {
		return Key[X509Certificate]{}, fmt.Errorf("%w: %w", ErrCreatingCertificate, err)
	}

	return Key[X509Certificate]{
		ID:  publicKey.ID,
		Key: X509Certificate(base64.StdEncoding.EncodeToString(d)),
	}, nil
}
