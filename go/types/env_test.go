package types

import (
	"bytes"
	"io"
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

func TestEnvEvaluate(t *testing.T) {
	env := []string{
		"hello=world",
		"myvar=var",
	}

	s := `This is a really long string ${hello}
${myvar} is set to var`

	assert.Equal(t, EnvEvaluate(env, s), `This is a really long string world
var is set to var`)
}

func TestEnvFilterR(t *testing.T) {
	f := NewEnvFilter([]string{
		"a=bbbbbb",
		"c=dddddd",
	}, bytes.NewBufferString(`${a} is not equal to ${c}`))

	b, err := io.ReadAll(f)
	assert.HasErr(t, err, nil)
	assert.Equal(t, string(b), `bbbbbb is not equal to dddddd`)
}
