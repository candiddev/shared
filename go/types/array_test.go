package types

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestArrayFlatten(t *testing.T) {
	assert.Equal(t, ArrayFlatten([]any{"a", []any{"b", []any{"c", []any{"d"}}}}), []any{"a", "b", "c", "d"})
}
