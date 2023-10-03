package logger

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/errs"
)

func TestLog(t *testing.T) {
	ctx := context.Background()
	ctx = SetAttribute(ctx, "key1", "value1")
	ctx = SetAttribute(ctx, "key2", "value2")

	tests := map[string]struct {
		err        errs.Err
		format     Format
		level      Level
		minLevel   Level
		noColor    bool
		outputWant string
		outputNot  string
	}{
		"error": {
			err:        errs.ErrReceiver.Wrap(errors.New("test")),
			format:     FormatKV,
			level:      LevelError,
			outputWant: ColorRed + `level="ERROR"`,
		},
		"error none": {
			err:       errs.ErrReceiver.Wrap(errors.New("test")),
			format:    FormatKV,
			level:     LevelError,
			minLevel:  LevelNone,
			outputNot: ColorRed,
		},
		"error no color": {
			err:       errs.ErrReceiver.Wrap(errors.New("test")),
			level:     LevelError,
			noColor:   true,
			outputNot: ColorRed,
		},
		"debug disabled": {
			err:       errs.ErrSenderBadRequest.Wrap(errors.New("test")),
			level:     LevelDebug,
			outputNot: "DEBUG",
		},
		"debug human": {
			err:        errs.ErrSenderBadRequest.Wrap(errors.New("test")),
			level:      LevelDebug,
			minLevel:   LevelDebug,
			outputWant: ColorBlue + "DEBUG",
		},
		"debug kv": {
			format:     FormatKV,
			err:        errs.ErrSenderBadRequest.Wrap(errors.New("test")),
			level:      LevelDebug,
			minLevel:   LevelDebug,
			outputWant: ColorBlue + `level="DEBUG"`,
		},
		"info": {
			level:      LevelInfo,
			minLevel:   LevelInfo,
			outputWant: "hello",
		},
		"info none": {
			level:     LevelInfo,
			minLevel:  LevelError,
			outputNot: "hello",
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			SetStd()

			ctx = SetFormat(ctx, tc.format)
			ctx = SetLevel(ctx, tc.minLevel)
			noColor = tc.noColor

			switch tc.level { //nolint:exhaustive
			case LevelDebug:
				Debug(ctx, "hello")
			case LevelError:
				Error(ctx, tc.err)
			case LevelInfo:
				Info(ctx, "hello")
			}

			out := ReadStd()

			if tc.outputWant == "" {
				assert.Equal(t, strings.Contains(out, tc.outputNot), false)
			} else {
				assert.Contains(t, out, tc.outputWant)

				if tc.err != nil {
					assert.Contains(t, out, "logger/logger_test.go:")
					if tc.format == FormatKV {
						assert.Contains(t, out, `key2="value2"`)
					}
				}
			}
		})
	}
}

func BenchmarkLog(b *testing.B) {
	ctx := context.Background()
	ctx = SetLevel(ctx, LevelDebug)
	ctx = SetAttribute(ctx, "hello", "world")
	ctx = SetAttribute(ctx, "a", "b")
	ctx = SetAttribute(ctx, "c", "d")

	for i := 0; i < b.N; i++ {
		writeLog(ctx, LevelError, nil, "hello")
	}

	b.ReportAllocs()
}
