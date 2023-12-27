package logger

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestMasker(t *testing.T) {
	SetStd()

	n := NewMaskLogger(Stdout, []string{"hide", "me"})
	_, err := n.Write([]byte("hide ThisString_form_eMEmehide "))
	assert.HasErr(t, err, nil)

	assert.Equal(t, ReadStd(), "*** ThisString_form_eME****** ")
}
