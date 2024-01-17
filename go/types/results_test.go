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
		"a:\n\tb\n\tc\n\td",
		"hello:\n\tperson\n\twoman\n\tman\n\tcamera\n\ttv",
	})
}
