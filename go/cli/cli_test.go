package cli

import (
	"context"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/logger"
	"github.com/candiddev/shared/go/types"
)

func TestAppRun(t *testing.T) {
	run := false

	BuildVersion = "1.0"

	date := types.CivilDateToday()

	a := App[*C]{
		Commands: map[string]Command[*C]{
			"hello": {
				ArgumentsRequired: []string{
					"arg1",
				},
				Flags: Flags{
					"r": {
						Placeholder: "value",
						Usage:       "add value to list",
					},
				},
				Name: "hello-world",
				Run: func(ctx context.Context, args []string, flags Flags, config *C) errs.Err {
					run = true

					return nil
				},
				Usage: "Does the thing",
			},
			"fail": {
				Run: func(ctx context.Context, args []string, flags Flags, config *C) errs.Err {
					return errs.ErrSenderPaymentRequired
				},
				Usage: "Fails the thing",
			},
		},
		Config:      &C{},
		Description: "Does things",
		HideConfigFields: []string{
			"Hide",
		},
		Name: "App",
	}

	wd, _ := os.Getwd()

	tests := map[string]struct {
		args      []string
		buildDate string
		err       error
		output    string
		noParse   bool
		run       bool
		wantPath  string
	}{
		"usage": {
			err: ErrUnknownCommand,
			output: `App <global flags> [command]

Does things

Commands:
  autocomplete
    Source this argument using ` + "`source <(app autocomplete)`" + ` to add
    autocomplete entries.

  fail
    Fails the thing

  hello-world <command flags> [arg1]
    Does the thing

    Command Flags:
      -r [value]
         add value to list

  jq <command flags> [jq query, default: .]
    Query JSON from stdin using jq. Supports standard JQ queries.

    Command Flags:
      -r
         render raw values

  show-config
    Print the current configuration.

  version
    Print version information.

Global Flags:
  -c [path]
     Path to JSON/Jsonnet configuration file (default: app.jsonnet)
  -d
     Disable external Jsonnet native functions like getPath and getRecord
  -f [format]
     Set log format: human, kv, raw (default: human)
  -l [level]
     Set minimum log level: none, debug, info, error (default: info)
  -n
     Disable colored logging
  -x [key=value]
     Set config key=value (can be provided multiple times)
`,
			wantPath: "app.jsonnet",
		},
		"missing arg": {
			args: []string{"hello-world"},
			err:  ErrUnknownCommand,
			output: logger.ColorRed + `ERROR missing arguments: [arg1]` + logger.ColorReset + `

  hello-world <command flags> [arg1]
    Does the thing

    Command Flags:
      -r [value]
         add value to list

Global Flags:
  -c [path]
     Path to JSON/Jsonnet configuration file (default: app.jsonnet)
  -d
     Disable external Jsonnet native functions like getPath and getRecord
  -f [format]
     Set log format: human, kv, raw (default: human)
  -l [level]
     Set minimum log level: none, debug, info, error (default: info)
  -n
     Disable colored logging
  -x [key=value]
     Set config key=value (can be provided multiple times)
`,
			wantPath: "app.jsonnet",
		},
		"config": {
			args: []string{"-n", "-c", "./testdata/config.json", "show-config"},
			output: `
  "Show": {
    "Message": "Hello World"
  }`,
			wantPath: filepath.Join(wd, "testdata/config.json"),
		},
		"world": {
			args: []string{"-n", "-c", "./testdata/config.json", "hello", "world"},
			run:  true,
		},
		"fail": {
			args:   []string{"-n", "-c", "./testdata/config.json", "fail"},
			err:    errs.ErrSenderPaymentRequired,
			output: "",
		},
		"usage no parse": {
			args:    []string{},
			err:     ErrUnknownCommand,
			noParse: true,
			output: `App <global flags> [command]

Does things

Commands:
  autocomplete
    Source this argument using ` + "`source <(app autocomplete)`" + ` to add
    autocomplete entries.

  fail
    Fails the thing

  hello-world <command flags> [arg1]
    Does the thing

    Command Flags:
      -r [value]
         add value to list

  jq <command flags> [jq query, default: .]
    Query JSON from stdin using jq. Supports standard JQ queries.

    Command Flags:
      -r
         render raw values

  version
    Print version information.

Global Flags:
  -f [format]
     Set log format: human, kv, raw (default: human)
  -l [level]
     Set minimum log level: none, debug, info, error (default: info)
  -n
     Disable colored logging
`,
		},
		"missing-arg": {
			args:      []string{"-n", "-c", "./testdata/config.json", "hello"},
			buildDate: types.CivilDateToday().AddDays(-1 * 30 * 5).String(),
			err:       ErrUnknownCommand,
		},
		"version": {
			args:      []string{"version"},
			buildDate: date.String(),
			noParse:   true,
			output: fmt.Sprintf(`Build Version: 1.0
Build Date: %s`, date),
		},
		"bad-flag": {
			args:    []string{"--version"},
			err:     errs.ErrReceiver,
			noParse: true,
			output: logger.ColorRed + `ERROR flag provided but not defined: --version` + logger.ColorReset + `
Usage: App <global flags> [command]

Does things

Commands:
  autocomplete
    Source this argument using ` + "`source <(app autocomplete)`" + ` to add
    autocomplete entries.

  fail
    Fails the thing

  hello-world <command flags> [arg1]
    Does the thing

    Command Flags:
      -r [value]
         add value to list

  jq <command flags> [jq query, default: .]
    Query JSON from stdin using jq. Supports standard JQ queries.

    Command Flags:
      -r
         render raw values

  version
    Print version information.

Global Flags:
  -f [format]
     Set log format: human, kv, raw (default: human)
  -l [level]
     Set minimum log level: none, debug, info, error (default: info)
  -n
     Disable colored logging
`,
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			delete(a.Commands, "show-config")
			BuildDate = tc.buildDate
			a.Config.CLI.NoColor = false
			a.NoParse = tc.noParse
			run = false

			os.Args = append([]string{"app"}, tc.args...)
			flag.CommandLine = flag.NewFlagSet(os.Args[0], flag.ExitOnError)

			logger.SetStd()

			err := a.Run()

			assert.HasErr(t, err, tc.err)

			out := logger.ReadStd()

			if tc.wantPath != "" {
				assert.Equal(t, a.Config.CLI.ConfigPath, tc.wantPath)
			}

			if tc.run {
				assert.Equal(t, run, tc.run)
			} else {
				assert.Contains(t, out, tc.output)
			}
		})
	}
}
