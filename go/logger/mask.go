package logger

import (
	"bytes"
	"io"
)

// Masker is an io.Writer.
type Masker struct {
	output io.Writer
	words  []string
}

// NewMaskLogger returns an io.Writer that masks output for another writer.
func NewMaskLogger(output io.Writer, words []string) io.Writer {
	return &Masker{
		output: output,
		words:  words,
	}
}

func (m *Masker) Write(p []byte) (n int, err error) {
	l := len(p)

	for i := range m.words {
		p = bytes.ReplaceAll(p, []byte(m.words[i]), []byte("***"))
	}

	n, err = m.output.Write(p)
	if err != nil {
		return n, err
	}

	// Report the original length to avoid short write errors
	return l, err
}
