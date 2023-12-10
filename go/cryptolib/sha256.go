package cryptolib

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
)

const SignatureHashSHA256 SignatureHash = "sha256"

// SHA256File accepts a file and returns the SHA or an error.
func SHA256File(f *os.File) (string, error) {
	s := sha256.New()
	if _, err := io.Copy(s, f); err != nil {
		return "", fmt.Errorf("error creating SHA: %w", err)
	}

	return hex.EncodeToString(s.Sum(nil)), nil
}

// SHA256String accepts a strings and returns the SHA.
func SHA256String(s string) string {
	return fmt.Sprintf("%x", sha256.Sum256([]byte(s)))
}
