package config

import (
	"context"
	"os"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/logger"
)

func TestGetFile(t *testing.T) {
	logger.UseTestLogger(t)

	stdin := os.Stdin

	os.WriteFile("../good.jsonnet", []byte(`{app:{debug: false}}`), 0600)

	tests := map[string]struct {
		err   bool
		input string
		stdin string
		want  bool
	}{
		"missing": {
			err:   true,
			input: "testdata/missing.json",
			want:  true,
		},
		"invalid json": {
			err:   true,
			input: "testdata/invalid.json",
			want:  true,
		},
		"good json": {
			input: "testdata/good.json",
		},
		"good jsonnet": {
			input: "good.jsonnet",
		},
		"bad jsonnet": {
			input: "good.json",
			want:  true,
		},
		"bad jsonnet path": {
			err:   true,
			input: "./good.json",
			want:  true,
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			ctx := context.Background()

			c := config{}
			c.App.Debug = true

			assert.Equal(t, GetFile(ctx, &c, tc.input) != nil, tc.err)
			assert.Equal(t, c.App.Debug, tc.want)
		})
	}

	os.Stdin = stdin
	os.Remove("../good.jsonnet")
}
