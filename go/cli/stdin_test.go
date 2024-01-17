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

	var out1 []byte

	var out2 []byte

	var out3 []byte

	r, w, _ := os.Pipe()
	os.Stdin = r

	wg := sync.WaitGroup{}

	logger.SetStd()

	wg.Add(1)

	go func() {
		out1, err = Prompt("Hello1:", "@", false) // term.ReadPassword doesn't like tests
		out2, err = Prompt("Hello2:", "@", false) // term.ReadPassword doesn't like tests

		wg.Done()
	}()

	w.WriteString("world@world!@")
	w.Close()
	wg.Wait()

	assert.HasErr(t, err, nil)
	assert.Equal(t, string(out1), "world")
	assert.Equal(t, string(out2), "world!")

	r, w, _ = os.Pipe()
	os.Stdin = r

	wg.Add(1)

	go func() {
		out1, err = Prompt("A:", "", false) // term.ReadPassword doesn't like tests
		out2, err = Prompt("B:", "", false) // term.ReadPassword doesn't like tests
		out3, err = Prompt("C:", "", false) // term.ReadPassword doesn't like tests

		wg.Done()
	}()

	w.WriteString("a\nb\nc\n")
	w.Close()
	wg.Wait()

	assert.HasErr(t, err, nil)
	assert.Equal(t, string(out1), "a")
	assert.Equal(t, string(out2), "b")
	assert.Equal(t, string(out3), "c")
}

func TestStdin(t *testing.T) {
	SetStdin("hello")
	assert.Equal(t, ReadStdin(), []byte("hello"))
}
