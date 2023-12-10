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
func Prompt(prompt string, eol string, noEcho bool) ([][]byte, error) {
	if eol == "" {
		eol = "\n"
	}

	var out []byte

	var err error

	// Early read of stdin in case it's piped
	if f, err := os.Stdin.Stat(); err == nil && f.Mode()&os.ModeNamedPipe != 0 {
		out, err := io.ReadAll(os.Stdin)
		if err == nil {
			return bytes.Split(out, []byte(eol)), nil
		}
	}

	fmt.Fprintf(logger.Stdout, "%s ", prompt) //nolint:forbidigo

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

	fmt.Fprintf(logger.Stdout, "\n") //nolint:forbidigo

	if err != nil {
		return nil, fmt.Errorf("error reading value: %w", err)
	}

	return [][]byte{out}, nil
}

// ReadStdin returns the current value of os.Stdin.
func ReadStdin() string {
	b, e := io.ReadAll(os.Stdin)
	if e == nil {
		return strings.TrimSpace(string(b))
	}

	return ""
}

// SetStdin sets a value to be passed to stdin.
func SetStdin(in string) {
	r, w, _ := os.Pipe()
	os.Stdin = r

	w.WriteString(strings.TrimSpace(in)) //nolint:errcheck
	w.Close()
}
