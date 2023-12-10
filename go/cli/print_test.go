package cli

import (
	"context"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/config"
	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/logger"
)

type C struct {
	CLI   Config
	Hide  msg
	Other msg
	Show  msg
}

func (c *C) CLIConfig() *Config {
	return &c.CLI
}

func (c *C) Parse(ctx context.Context, configArgs []string) errs.Err {
	return config.Parse(ctx, c, configArgs, "cli", c.CLI.ConfigPath)
}

type msg struct {
	Message string `json:"Message,omitempty"` //nolint:tagliatelle
}

func TestPrint(t *testing.T) {
	out := map[string]any{
		"b": true,
		"d": 1,
		"a": "e",
	}

	logger.SetStd()
	assert.HasErr(t, Print(out), nil)
	assert.Equal(t, logger.ReadStd(), `{
  "a": "e",
  "b": true,
  "d": 1
}
`)
}

func TestPrintConfig(t *testing.T) {
	ctx := context.Background()

	c := C{
		Hide: msg{
			Message: "Hello",
		},
		Show: msg{
			Message: "World",
		},
	}

	logger.SetStd()

	assert.Equal(t, printConfig(ctx, App[*C]{
		Config: &c,
		HideConfigFields: []string{
			"Hide",
			"Other",
		},
	}), nil)

	assert.Equal(t, logger.ReadStd(), `{
  "CLI": {
    "configPath": "",
    "logFormat": "",
    "logLevel": "",
    "noColor": false
  },
  "Show": {
    "Message": "World"
  }
}
`)
}
