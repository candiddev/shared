package cryptolib

import (
	"fmt"
	"runtime"
	"strconv"
	"strings"

	"github.com/candiddev/shared/go/cli"
	"github.com/candiddev/shared/go/types"
	"golang.org/x/crypto/argon2"
)

const (
	AlgorithmArgon2     = "argon2"
	KDFArgon2ID     KDF = KDF(AlgorithmArgon2) + "id"
)

type argon2ID struct{}

// Argon2ID is a PBKDF.
var Argon2ID = &argon2ID{} //nolint:gochecknoglobals

func (*argon2ID) Algorithm() Algorithm {
	return AlgorithmArgon2
}

func (*argon2ID) KDF() KDF {
	return KDFArgon2ID
}

func (*argon2ID) KDFGet(input, keyID string) (key []byte, err error) {
	pass, err := cli.Prompt(fmt.Sprintf("Password for %s:", keyID), "", true)
	if err != nil {
		return nil, err
	}

	s := strings.Split(input, "-")
	if len(s) != 4 && len(s) != 5 {
		return nil, fmt.Errorf("unable to decode KDF input: %s", input)
	}

	salt := s[0]

	time, err := strconv.Atoi(s[1])
	if err != nil {
		return nil, fmt.Errorf("unable to decode KDF time: %w", err)
	}

	memory, err := strconv.Atoi(s[2])
	if err != nil {
		return nil, fmt.Errorf("unable to decode KDF memory: %w", err)
	}

	l, err := strconv.Atoi(s[3])
	if err != nil {
		return nil, fmt.Errorf("unable to decode KDF len: %w", err)
	}

	p := runtime.NumCPU()

	if len(s) == 5 {
		p, err = strconv.Atoi(s[4])
		if err != nil {
			return nil, fmt.Errorf("unable to decode KDF parallelism: %w", err)
		}
	}

	key = argon2.IDKey(pass, []byte(salt), uint32(time), uint32(memory), uint8(p), uint32(l))

	return key, nil
}

func (*argon2ID) KDFSet() (input string, key []byte, err error) {
	pass, err := cli.Prompt("New Password (empty string skips PBKDF):", "", true)
	if err != nil {
		return "", nil, err
	}

	passC, err := cli.Prompt("Confirm Password (empty string skips PBKDF):", "", true)
	if err != nil {
		return "", nil, err
	}

	if string(pass) != string(passC) {
		return "", nil, fmt.Errorf("passwords do not match")
	}

	if string(pass) == "" {
		return "", nil, nil
	}

	salt := types.RandString(16)
	time := uint32(1)
	memory := uint32(64 * 1024)
	l := uint32(32)

	key = argon2.IDKey(pass, []byte(salt), time, memory, uint8(1), l)

	return fmt.Sprintf("% s-%d-%d-%d-1", salt, time, memory, l), key, nil
}

func (*argon2ID) Provides(Encryption) bool {
	return false
}
