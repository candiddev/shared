package jsonnet

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/logger"
)

func TestConvert(t *testing.T) {
	ctx := logger.UseTestLogger(t)

	s, err := Convert(ctx, map[string]any{
		"bool":   true,
		"int":    1,
		"string": "a",
	})
	assert.HasErr(t, err, nil)
	assert.Equal(t, s, `{
  bool: true,
  int: 1,
  string: 'a',
}
`)
}
