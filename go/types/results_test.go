package types

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestResults(t *testing.T) {
	assert.Equal(t, Results{
		"hello": {
			"person",
			"woman",
			"man",
			"camera",
			"tv",
		},
		"a": {
			"b\nc\nd",
		},
	}.Show(), []string{
		"a:\n    b\n    c\n    d",
		"hello:\n    person\n    woman\n    man\n    camera\n    tv",
	})
}
