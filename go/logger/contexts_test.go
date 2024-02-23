package logger

import (
	"context"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func ctxer(ctx context.Context) {
	ctx = SetAttribute(ctx, "b", true)
	ctx = SetAttribute(ctx, "a", true) //nolint
}

func TestAttributes(t *testing.T) {
	ctx := SetAttribute(context.Background(), "key", "value")

	assert.Equal(t, GetAttributes(ctx), []string{"key"})

	ctx1 := SetAttribute(ctx, "int", 1)
	ctx = SetAttribute(ctx1, "bool", false)
	ctx = SetAttribute(ctx, "bool", true)
	ctxer(ctx)

	assert.Equal(t, GetAttributes(ctx), []string{"bool", "int", "key"})
	assert.Equal(t, GetAttributes(ctx1), []string{"int", "key"})
	assert.Equal(t, GetAttribute[string](ctx, "key"), "value")
	assert.Equal(t, GetAttribute[bool](ctx, "bool"), true)
	assert.Equal(t, GetAttribute[int](ctx, "int"), 1)
	assert.Equal(t, GetAttribute[string](ctx, "eh"), "")
}
