package config

import (
	"context"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestMask(t *testing.T) {
	c := &config{
		Vars: map[string]any{
			"hello": "world",
			"yes":   false,
		},
	}
	ctx := context.Background()

	out, err := Mask(ctx, c, []string{
		"app",
		"vars.hello",
	})
	assert.HasErr(t, err, nil)
	assert.Equal(t, out, map[string]any{
		"commands": nil,
		"vars": map[string]any{
			"yes": false,
		},
	})
}
