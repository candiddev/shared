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
	if len(s) != 4 {
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

	key = argon2.IDKey(pass[0], []byte(salt), uint32(time), uint32(memory), uint8(runtime.NumCPU()), uint32(l))

	return key, nil
}

func (*argon2ID) KDFSet() (input string, key []byte, err error) {
	pass, err := cli.Prompt("New Password (empty string skips PBKDF):", "", true)
	if err != nil {
		return "", nil, err
	}

	var passC [][]byte

	if len(pass) == 1 {
		passC, err = cli.Prompt("Confirm Password (empty string skips PBKDF):", "", true)
		if err != nil {
			return "", nil, err
		}
	} else {
		passC = pass[:1]
	}

	if string(pass[0]) != string(passC[0]) {
		return "", nil, fmt.Errorf("passwords do not match")
	}

	if string(pass[0]) == "" {
		return "", nil, nil
	}

	salt := types.RandString(16)
	time := uint32(1)
	memory := uint32(64 * 1024)
	l := uint32(32)

	key = argon2.IDKey(pass[0], []byte(salt), time, memory, uint8(runtime.NumCPU()), l)

	return fmt.Sprintf("% s-%d-%d-%d", salt, time, memory, l), key, nil
}

func (*argon2ID) Provides(Encryption) bool {
	return false
}
