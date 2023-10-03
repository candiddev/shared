package types

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestJSONToString(t *testing.T) {
	assert.Equal(t, JSONToString(map[string]any{
		"hello": "world",
		"test":  true,
	}), `{
  "hello": "world",
  "test": true
}`)
}
