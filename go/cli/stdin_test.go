package cli

import (
	"os"
	"sync"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/logger"
)

func TestPrompt(t *testing.T) {
	var err error

	var out [][]byte

	r, w, _ := os.Pipe()
	os.Stdin = r

	wg := sync.WaitGroup{}

	logger.SetStd()

	wg.Add(1)

	go func() {
		out, err = Prompt("Hello:", "@", false) // term.ReadPassword doesn't like tests

		wg.Done()
	}()

	w.WriteString("world@world@")
	w.Close()
	wg.Wait()

	assert.HasErr(t, err, nil)
	assert.Equal(t, string(out[0]), "world")
	assert.Equal(t, len(out), 3)

	r, w, _ = os.Pipe()
	os.Stdin = r

	wg.Add(1)

	go func() {
		out, err = Prompt("Hello:", "", false) // term.ReadPassword doesn't like tests

		wg.Done()
	}()

	w.WriteString("world\nworld\n")
	w.Close()
	wg.Wait()

	assert.HasErr(t, err, nil)
	assert.Equal(t, len(out), 3)
}

func TestStdin(t *testing.T) {
	SetStdin("hello")
	assert.Equal(t, ReadStdin(), "hello")
}
