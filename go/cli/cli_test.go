package cli

import (
	"context"
	"flag"
	"fmt"
	"os"
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
				ArgumentsOptional: []string{
					"arg2",
				},
				ArgumentsRequired: []string{
					"arg1",
				},
				Name: "hello world",
				Run: func(ctx context.Context, args []string, config *C) errs.Err {
					run = true

					return nil
				},
				Usage: "Does the thing",
			},
			"fail": {
				Run: func(ctx context.Context, args []string, config *C) errs.Err {
					return errs.ErrClientPaymentRequired
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

	tests := map[string]struct {
		args      []string
		buildDate string
		err       error
		output    string
		noParse   bool
		run       bool
	}{
		"usage": {
			err: ErrUnknownCommand,
			output: `Usage: App [flags] [command]

Does things

Commands:
  fail
    	Fails the thing
  hello world [arg1] [arg2, optional]
    	Does the thing
  show-config
    	Print the current configuration
  version
    	Print version information

Flags:
  -c string
    	Path to JSON/YAML configuration files separated by a comma
  -d	Enable debug logging
  -j	Output JSON instead of YAML
  -n	Disable colored logging
  -x string
    	Comma separated list of config key=value pairs
`,
		},
		"config": {
			args: []string{"-n", "-c", "./testdata/config.yaml", "show-config"},
			output: `
Show:
  Message: Hello World`,
		},
		"world": {
			args: []string{"-n", "-c", "./testdata/config.yaml", "hello", "world"},
			run:  true,
		},
		"fail": {
			args:   []string{"-n", "-c", "./testdata/config.yaml", "fail"},
			err:    errs.ErrClientPaymentRequired,
			output: "",
		},
		"usage no parse": {
			args:    []string{},
			err:     ErrUnknownCommand,
			noParse: true,
			output: `Usage: App [flags] [command]

Does things

Commands:
  fail
    	Fails the thing
  hello world [arg1] [arg2, optional]
    	Does the thing
  version
    	Print version information

Flags:
  -d	Enable debug logging
  -j	Output JSON instead of YAML
  -n	Disable colored logging
`,
		},
		"missing-arg": {
			args:      []string{"-n", "-c", "./testdata/config.yaml", "hello"},
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
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			delete(a.Commands, "show-config")
			BuildDate = tc.buildDate
			a.Config.CLI.Debug = false
			a.Config.CLI.NoColor = false
			a.NoParse = tc.noParse
			run = false

			os.Args = append([]string{"app"}, tc.args...)
			flag.CommandLine = flag.NewFlagSet(os.Args[0], flag.ExitOnError)

			logger.SetStd()

			err := a.Run()

			assert.HasErr(t, err, tc.err)

			out := logger.ReadStd()

			if tc.run {
				assert.Equal(t, run, tc.run)
			} else {
				assert.Contains(t, out, tc.output)
			}
		})
	}
}
