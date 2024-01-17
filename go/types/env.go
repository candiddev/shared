package types

import (
	"errors"
	"fmt"
	"io"
	"regexp"
	"sort"
	"strings"
)

var (
	envAllowedCharacters = regexp.MustCompile(`^(\w|_)+$`)
	envStartsWithInt     = regexp.MustCompile(`^\d`)
)

var ErrEnvAllowedCharacters = errors.New("must only contain letters, underscores, and numbers")
var ErrEnvStartsWithInt = errors.New("must not start with a number")

// EnvVars is a map of environment variables.
type EnvVars map[string]string

// EnvValidate checks if a string is a valid environment variable.
func EnvValidate(s string) error {
	switch {
	case envStartsWithInt.MatchString(s):
		return ErrEnvStartsWithInt
	case !envAllowedCharacters.MatchString(s):
		return ErrEnvAllowedCharacters
	}

	return nil
}

// GetEnv returns a list of environment variables in k=v format.
func (e EnvVars) GetEnv() []string {
	keys := []string{}

	for k := range e {
		keys = append(keys, k)
	}

	sort.Strings(keys)

	s := make([]string, len(keys))

	for i := range keys {
		s[i] = keys[i] + "=" + e[keys[i]]
	}

	return s
}

// EnvEvaluate evaluates variables in a string.
func EnvEvaluate(env []string, s string) string {
	for i := range env {
		e := strings.Split(env[i], "=")
		r := regexp.MustCompile(fmt.Sprintf(`(^|[^\$])\${%s}`, e[0]))
		s = r.ReplaceAllString(s, "${1}"+e[1])
	}

	r := regexp.MustCompile(`\$\${(\S+)}`)
	s = r.ReplaceAllString(s, "${$1}")

	return s
}

// EnvFilter is an io.Reader that parses env variables.
type EnvFilter struct {
	env    []string
	reader io.Reader
}

// NewEnvFilter returns a new EnvFilter.
func NewEnvFilter(env []string, reader io.Reader) *EnvFilter {
	return &EnvFilter{
		env:    env,
		reader: reader,
	}
}

// Read satisfies the io.Reader interface.
func (e *EnvFilter) Read(p []byte) (n int, err error) {
	n, err = e.reader.Read(p)
	if err != nil {
		return n, err
	}

	n = copy(p, []byte(EnvEvaluate(e.env, string(p[:n]))))

	return n, err
}
