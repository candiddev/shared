package cli

import (
	"bufio"
	"bytes"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/candiddev/shared/go/logger"
	"golang.org/x/term"
)

// Prompt prompts the user for input.
func Prompt(prompt string, eol string, noEcho bool) ([]byte, error) {
	if eol == "" {
		eol = "\n"
	}

	var out []byte

	var err error

	// Early read of stdin in case it's piped
	if f, err := os.Stdin.Stat(); err == nil && f.Mode()&os.ModeNamedPipe != 0 {
		out, err := io.ReadAll(os.Stdin)
		if err == nil {
			b := bytes.Split(out, []byte(eol))

			if len(b) > 1 {
				SetStdin(string(bytes.Join(b[1:], []byte(eol))))
			} else if len(b) == 0 {
				return nil, nil
			}

			return b[0], nil
		}
	}

	fmt.Fprintf(logger.Stderr, "%s ", prompt) //nolint:forbidigo

	if len(eol) > 1 {
		return nil, fmt.Errorf("prompt delimiter must be 1 character")
	}

	if noEcho && term.IsTerminal(int(os.Stdin.Fd())) && eol == "\n" {
		out, err = term.ReadPassword(int(os.Stdin.Fd()))
	} else {
		r := bufio.NewReader(os.Stdin)
		out, err = r.ReadBytes(eol[0])
		if len(out) > 0 {
			out = out[:len(out)-1]
		}
	}

	fmt.Fprintf(logger.Stderr, "\n") //nolint:forbidigo

	if err != nil {
		return nil, fmt.Errorf("error reading value: %w", err)
	}

	return out, nil
}

// ReadStdin returns the entire value of os.Stdin, if it has a value.
func ReadStdin() []byte {
	if f, err := os.Stdin.Stat(); err == nil && f.Mode()&os.ModeNamedPipe != 0 {
		out, err := io.ReadAll(os.Stdin)
		if err == nil {
			return out
		}
	}

	return nil
}

// SetStdin sets a value to be passed to stdin.
func SetStdin(in string) {
	r, w, _ := os.Pipe()
	os.Stdin = r

	w.WriteString(strings.TrimSpace(in)) //nolint:errcheck
	w.Close()
}
