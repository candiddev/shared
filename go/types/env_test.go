package types

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestEnvValidate(t *testing.T) {
	tests := map[string]struct {
		err   error
		input string
	}{
		"starts with number": {
			err:   ErrEnvStartsWithInt,
			input: "1_234",
		},
		"has bad characters": {
			err:   ErrEnvAllowedCharacters,
			input: "a-234",
		},
		"good": {
			input: "_HELLO",
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			assert.HasErr(t, EnvValidate(tc.input), tc.err)
		})
	}
}
