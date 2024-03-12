// Package cli contains functions for building CLIs.
package cli

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"text/template"

	"github.com/candiddev/shared/go/config"
	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/jsonnet"
	"github.com/candiddev/shared/go/logger"
	"golang.org/x/term"
)

// BuildDate is the application build date in YYYY-MM-DD, set with candid/lib/cli.Builddate build time variable.
var BuildDate string //nolint:gochecknoglobals

// BuildVersion is the application version, set with candid/lib/cli.BuildVersion build time variable.
var BuildVersion string //nolint:gochecknoglobals

// Config manages the CLI configuration.
type Config struct {
	ConfigPath            string        `json:"configPath"`
	DisableExternalNative bool          `json:"disableExternalNative"`
	LogFormat             logger.Format `json:"logFormat"`
	LogLevel              logger.Level  `json:"logLevel"`
	NoColor               bool          `json:"noColor"`
	runMock               *runMock
	runMockEnable         bool
}

type runMock struct {
	inputs  []RunMockInput
	errs    []error
	mutex   *sync.Mutex
	outputs []string
}

// Command is a positional command to run.
type Command[T AppConfig[any]] struct {
	/* Positional arguments required after command */
	ArgumentsRequired []string

	/* Positional arguments optional after command */
	ArgumentsOptional []string

	/* Optional flags and their usage */
	Flags Flags

	/* Override the command name in usage */
	Name string

	/* Function to run when calling the command */
	Run func(ctx context.Context, args []string, flags Flags, config T) errs.Err

	/* Usage information, omitting this hides the command */
	Usage string
}

var ErrUnknownCommand = errs.ErrSenderNotFound.Wrap(errors.New("unknown command"))

// App is a CLI application.
type App[T AppConfig[any]] struct {
	Commands         map[string]Command[T]
	Config           T
	Description      string
	HideConfigFields []string
	Name             string
	NoParse          bool

	flags Flags
}

func wrapLines(l int, lines string, indent string) string {
	s := strings.Fields(strings.TrimSpace(lines))
	if len(s) == 0 {
		return lines
	}

	o := s[0]
	n := l - len(o)

	for _, w := range s[1:] {
		if len(w)+1 > n {
			o += "\n" + indent + w
			n = l - len(w)
		} else {
			o += " " + w
			n -= 1 + len(w)
		}
	}

	return o
}

// AppConfig is a configuration that can be used with CLI.
type AppConfig[T any] interface {
	CLIConfig() *Config
	Parse(ctx context.Context, configArgs []string) errs.Err
}

type globalFlag string

const (
	globalFlagConfigPath            = "c"
	globalFlagDisableExternalNative = "d"
	globalFlagFormat                = "f"
	globalFlagLevel                 = "l"
	globalFlagNoColor               = "n"
	globalFlagConfigValue           = "x"
)

func (a App[T]) autocomplete() string {
	commandNames := []string{}

	for k, v := range a.Commands {
		if v.Usage != "" {
			commandNames = append(commandNames, k)
		}
	}

	sort.Strings(commandNames)

	flagNames := []string{}

	for k := range a.flags {
		f := "-" + k

		flagNames = append(flagNames, f)
	}

	sort.Strings(flagNames)

	t := template.Must(template.New("source").Funcs(template.FuncMap{
		"append": func(s1 []string, s2 []string) []string {
			return append(s1, s2...)
		},
		"flagKeys": func(f Flags) []string {
			keys := []string{}

			for k := range f {
				keys = append(keys, k)
			}

			sort.Strings(keys)

			return keys
		},
		"join": strings.Join,
	}).Parse(`#!/usr/bin/env bash

IFS=$'\n'

function _{{ .name }}() {
	local cur prev opts
	COMPREPLY=()
	cur="${COMP_WORDS[${COMP_CWORD}]}"
	match=""
	prev="${COMP_WORDS[${COMP_CWORD} - 1]}"
	words=""

	for ((i=${COMP_CWORD}; i >= 0; i--)); do
		case "${COMP_WORDS[i]}" in
{{- range $k, $v := .flags }}
{{- if $v.Options }}
		-{{ $k }})
			words='# {{ $v.Usage }}
{{ join $v.Options "\n" }}
'
			;;
{{- end }}
{{- end }}
{{- range $k, $v := .commands }}
{{- if $v.Usage }}
		{{ $k }})
			match=yes
			;;
{{- end }}
{{- end }}
	esac
done

	if [[ -z ${words} ]] && [[ -z ${match} ]]; then
		case "${cur}" in
			-*)
				words="{{ .flagNames }}"
				;;
			*)
				words="{{ .commandNames }}"
				;;
		esac
	fi

	if [[ -z ${words} ]]; then
	COMPREPLY=($(compgen -f -- "${cur}"))
	else
		COMPREPLY=($(compgen -W "${words}" -- "${cur}"))
	fi
}

complete -F _{{ .name }} {{ .arg0 }}
`))

	b := bytes.Buffer{}
	t.Execute(&b, map[string]any{ //nolint:errcheck
		"arg0":         filepath.Base(os.Args[0]),
		"commands":     a.Commands,
		"commandNames": strings.Join(commandNames, "\n"),
		"flags":        a.flags,
		"flagNames":    strings.Join(flagNames, "\n"),
		"name":         strings.ToLower(a.Name),
	})

	return b.String()
}

func (a App[T]) usage(arg string) {
	if arg == "" {
		//nolint:forbidigo
		fmt.Fprintf(logger.Stdout, `Usage: %s <global flags> [command]

%s

Commands:
`, a.Name, a.Description)
	} else {
		//nolint:forbidigo
		fmt.Fprintln(logger.Stdout)
	}

	c := []string{}

	for i := range a.Commands {
		if a.Commands[i].Usage != "" {
			c = append(c, i)
		}
	}

	sort.Strings(c)

	w, _, _ := term.GetSize(0)

	if w == 0 || w > 70 {
		w = 70
	}

	for i := range c {
		name := c[i]
		if (a.Commands[c[i]]).Name != "" {
			name = a.Commands[c[i]].Name
		}

		if arg != "" && arg != name {
			continue
		}

		flags := "\n"

		if len(a.Commands[c[i]].Flags) > 0 {
			name += " <command flags>"
			flags = fmt.Sprintf("\n\n    Command Flags:\n%s", a.Commands[c[i]].Flags.Usage(w, "      "))
		}

		for _, arg := range a.Commands[c[i]].ArgumentsRequired {
			name += fmt.Sprintf(" [%s]", arg)
		}

		for _, arg := range a.Commands[c[i]].ArgumentsOptional {
			name += fmt.Sprintf(" [%s]", arg)
		}

		usage := a.Commands[c[i]].Usage

		fmt.Fprintf(logger.Stdout, "  %s\n    %s%s\n", wrapLines(w, name, "  "), wrapLines(w, usage, "    "), flags) //nolint:forbidigo
	}

	//nolint: forbidigo
	fmt.Fprintf(logger.Stdout, "Global Flags:\n%s", a.flags.Usage(w, "  "))
}

// Run is the main entrypoint into a CLI app.
func (a App[T]) Run() errs.Err {
	ctx := context.Background()

	a.flags = Flags{
		globalFlagFormat: {
			Default:     []string{"human"},
			Options:     []string{"human", "kv", "raw"},
			Placeholder: "format",
			Usage:       "Set log format",
		},
		globalFlagLevel: {
			Default:     []string{"info"},
			Options:     []string{"none", "debug", "info", "error"},
			Placeholder: "level",
			Usage:       "Set minimum log level",
		},
		globalFlagNoColor: {
			Usage: "Disable colored logging",
		},
	}

	a.Commands["autocomplete"] = Command[T]{
		Run: func(ctx context.Context, args []string, flags Flags, config T) errs.Err {
			logger.Raw(a.autocomplete())

			return nil
		},
		Usage: fmt.Sprintf("Source this argument using `source <(%s autocomplete)` to add autocomplete entries.", strings.ToLower(a.Name)),
	}
	a.Commands["jq"] = Command[T]{
		ArgumentsOptional: []string{
			"jq query, default: .",
		},
		Flags: Flags{
			"r": {
				Usage: "render raw values",
			},
		},
		Run:   jq[T],
		Usage: "Query JSON from stdin using jq.  Supports standard JQ queries.",
	}

	if !a.NoParse {
		a.flags[globalFlagConfigPath] = &Flag{
			Default:     []string{strings.ToLower(a.Name) + ".jsonnet"},
			Placeholder: "path",
			Usage:       "Path to JSON/Jsonnet configuration file",
		}

		a.flags[globalFlagDisableExternalNative] = &Flag{
			Usage: "Disable external Jsonnet native functions like getPath and getRecord",
		}

		a.Commands["show-config"] = Command[T]{
			Run: func(ctx context.Context, args []string, flags Flags, config T) errs.Err {
				return printConfig(ctx, a)
			},
			Usage: "Print the current configuration.",
		}

		a.flags[globalFlagConfigValue] = &Flag{
			Placeholder: "key=value",
			Usage:       "Set config key=value (can be provided multiple times)",
		}
	}

	a.Commands["version"] = Command[T]{
		Run: func(ctx context.Context, args []string, flags Flags, config T) errs.Err {
			fmt.Fprintf(logger.Stdout, "Build Version: %s\n", BuildVersion) //nolint: forbidigo
			fmt.Fprintf(logger.Stdout, "Build Date: %s\n", BuildDate)       //nolint: forbidigo

			return nil
		},
		Usage: "Print version information.",
	}

	args, err := a.flags.Parse(os.Args[1:])
	if err != nil {
		err = logger.Error(ctx, err)

		a.usage("")

		return err
	}

	configArgs := []string{}

	// Parse CLI environment early for logging options.
	for k, v := range a.flags {
		var err errs.Err

		switch globalFlag(k) {
		case globalFlagConfigPath:
			a.Config.CLIConfig().ConfigPath, _ = a.flags.Value(k)
		case globalFlagConfigValue:
			configArgs = v.values
		case globalFlagDisableExternalNative:
			_, a.Config.CLIConfig().DisableExternalNative = a.flags.Value(k)
		case globalFlagFormat:
			format, _ := a.flags.Value(k)
			a.Config.CLIConfig().LogFormat, err = logger.ParseFormat(format)
		case globalFlagLevel:
			level, _ := a.flags.Value(k)
			a.Config.CLIConfig().LogLevel, err = logger.ParseLevel(level)
		case globalFlagNoColor:
			_, a.Config.CLIConfig().NoColor = a.flags.Value(k)
		}

		if err != nil {
			return logger.Error(ctx, err)
		}
	}

	jsonnet.DisableExternalNative(true)

	if err := config.ParseValues(ctx, a.Config, strings.ToUpper(a.Name)+"_cli_", os.Environ()); err != nil {
		return logger.Error(ctx, errs.ErrReceiver.Wrap(config.ErrUpdateEnv, err))
	}

	jsonnet.DisableExternalNative(a.Config.CLIConfig().DisableExternalNative)

	ctx = logger.SetFormat(ctx, a.Config.CLIConfig().LogFormat)
	ctx = logger.SetLevel(ctx, a.Config.CLIConfig().LogLevel)
	ctx = logger.SetNoColor(ctx, a.Config.CLIConfig().NoColor)

	if !a.NoParse {
		// Resolve the real config path early by walking parent directories.  If the real config path exists (isn't "") and is different than the current one, update the path value.
		if p := config.FindPathAscending(ctx, a.Config.CLIConfig().ConfigPath); p != "" && p != a.Config.CLIConfig().ConfigPath {
			a.Config.CLIConfig().ConfigPath = p
		}

		if err := a.Config.Parse(ctx, configArgs); err != nil {
			return err
		}
	}

	// Refresh ctx for new config values.
	ctx = logger.SetFormat(ctx, a.Config.CLIConfig().LogFormat)
	ctx = logger.SetLevel(ctx, a.Config.CLIConfig().LogLevel)
	ctx = logger.SetNoColor(ctx, a.Config.CLIConfig().NoColor)

	if len(args) < 1 {
		a.usage("")

		return ErrUnknownCommand
	}

	for k, v := range a.Commands {
		if k == args[0] || strings.Split(v.Name, " ")[0] == args[0] {
			ar := []string{args[0]}

			if len(args) > 1 {
				arr, err := v.Flags.Parse(args[1:])
				if err != nil {
					err = logger.Error(ctx, err)

					a.usage("")

					return err
				}

				ar = append(ar, arr...)
			}

			if len(v.ArgumentsRequired) != 0 && (len(ar)-1) < len(v.ArgumentsRequired) {
				logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("missing arguments: ["+strings.Join(v.ArgumentsRequired[0+len(ar)-1:], "] [")+"]\n"))) //nolint:errcheck

				a.usage(args[0])

				return ErrUnknownCommand
			}

			return v.Run(ctx, ar, v.Flags, a.Config)
		}
	}

	a.usage("")

	return ErrUnknownCommand
}
