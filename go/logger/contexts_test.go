package logger

import (
	"context"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestAttributes(t *testing.T) {
	ctx := SetAttribute(context.Background(), "key", "value")

	assert.Equal(t, `key="value"`, GetAttributes(ctx))

	ctx = SetAttribute(ctx, "bool", true)
	ctx = SetAttribute(ctx, "int", 1)

	assert.Equal(t, `key="value" bool=true int=1`, GetAttributes(ctx))
}
