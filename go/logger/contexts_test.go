package logger

import (
	"context"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestAttributes(t *testing.T) {
	ctx := SetAttribute(context.Background(), "key", "value")

	assert.Equal(t, GetAttributes(ctx), []string{"key"})

	ctx = SetAttribute(ctx, "bool", false)
	ctx = SetAttribute(ctx, "bool", true)
	ctx = SetAttribute(ctx, "int", 1)

	assert.Equal(t, GetAttributes(ctx), []string{"bool", "int", "key"})
	assert.Equal(t, GetAttribute[string](ctx, "key"), "value")
	assert.Equal(t, GetAttribute[bool](ctx, "bool"), true)
	assert.Equal(t, GetAttribute[int](ctx, "int"), 1)
	assert.Equal(t, GetAttribute[string](ctx, "eh"), "")
}
