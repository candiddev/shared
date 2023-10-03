package errs

import (
	"errors"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestErr(t *testing.T) {
	e1 := errors.New("hello")
	e2 := errors.New("world")

	err1 := ErrReceiver.Wrap(e1)
	err2 := err1.Wrap(e2)

	assert.Equal(t, err1.Is(e1), true)
	assert.Equal(t, err1.Is(err1), true)
	assert.Equal(t, err1.Is(e2), false)
	assert.Equal(t, err1.Is(err2), false)
	assert.Equal(t, err2.Is(e1), true)
	assert.Equal(t, err2.Is(err1), true)
	assert.Equal(t, err2.Is(e2), true)
	assert.Equal(t, err2.Is(err2), true)
	assert.Equal(t, err1.Like(ErrReceiver), true)
	assert.Equal(t, err1.Like(ErrSenderBadRequest), false)

	err1 = err1.Set("123")
	assert.Equal(t, err1.Message(), "123")
}
