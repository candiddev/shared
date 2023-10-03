package config

import (
	"context"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/logger"
)

func TestGetEnv(t *testing.T) {
	logger.UseTestLogger(t)

	tests := map[string]struct {
		err          error
		inputBaseURL string
		inputDebug   string
		inputPort    string
		inputStrings string
		wantDebug    bool
		wantStrings  customStrings
	}{
		"bad": {
			err:          ErrUpdateEnv,
			inputBaseURL: "{}",
			inputDebug:   "int",
			inputPort:    "10",
			wantDebug:    false,
		},
		"good": {
			inputBaseURL: "homechart.app",
			inputDebug:   "true",
			inputPort:    "10",
			inputStrings: "a,b,c",
			wantDebug:    true,
			wantStrings:  customStrings{"a", "b", "c"},
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			t.Setenv("HOMECHART_APP_BASEURL", tc.inputBaseURL)
			t.Setenv("HOMECHART_APP_DEBUG", tc.inputDebug)
			t.Setenv("HOMECHART_APP_PORT", tc.inputPort)
			t.Setenv("HOMECHART_APP_STRINGS", tc.inputStrings)

			ctx := context.Background()

			c := config{}
			assert.HasErr(t, getEnv(ctx, &c, "HOMECHART"), tc.err)
			assert.Equal(t, c.App.Debug, tc.wantDebug)
			assert.Equal(t, c.App.Strings, tc.wantStrings)
		})
	}
}
