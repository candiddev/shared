package cli

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/logger"
)

func TestParseArgs(t *testing.T) {
	tests := map[string]struct {
		input   []string
		wantOut []string
		wantErr bool
	}{
		"double": {
			input: []string{
				`"hello`,
				`world"`,
				"yes",
			},
			wantOut: []string{
				"hello world",
				"yes",
			},
		},
		"single": {
			input: []string{
				"'hello",
				"world'",
				"yes",
			},
			wantOut: []string{
				"hello world",
				"yes",
			},
		},
		"mixed": {
			input: []string{
				`"hello`,
				`world"`,
				"unquoted",
				"'yes",
				"this",
				"works'",
			},
			wantOut: []string{
				"hello world",
				"unquoted",
				"yes this works",
			},
		},
		"missing": {
			input: []string{
				`"hello`,
				"world",
				"unquoted",
				"'yes",
				"this",
				"works'",
			},
			wantErr: true,
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			o, err := parseArgs(tc.input)
			assert.Equal(t, err != nil, tc.wantErr)
			assert.Equal(t, o, tc.wantOut)
		})
	}
}

func TestRun(t *testing.T) {
	logger.UseTestLogger(t)

	ctx := context.Background()
	ctx = logger.SetFormat(ctx, logger.FormatKV)
	ctx = logger.SetNoColor(ctx, true)
	c := Config{}
	c.RunMock()
	c.RunMockErrors([]error{fmt.Errorf("hello"), nil})
	c.RunMockOutputs([]string{
		"a",
		"b",
	})

	gid := os.Getgid()
	uid := os.Getuid()

	tests := []struct {
		group      string
		mock       bool
		name       string
		stdout     bool
		user       string
		wantErr    bool
		wantOutput CmdOutput
	}{
		{
			name:       "real",
			stdout:     true,
			wantOutput: "config.json\n",
		},
		{
			mock:       true,
			name:       "mock 1",
			wantOutput: "a",
			wantErr:    true,
		},
		{
			mock:       true,
			name:       "mock 2",
			wantOutput: "b",
		},
		{
			mock:    true,
			name:    "bad_user",
			user:    "notarealuser",
			wantErr: true,
		},
		{
			mock: true,
			name: "good_user",
			user: strconv.Itoa(uid),
		},
		{
			group:   "notarealgroup",
			mock:    true,
			name:    "bad_group",
			wantErr: true,
		},
		{
			group: strconv.Itoa(gid),
			mock:  true,
			name:  "good_group",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			logger.SetStd()
			c.runMockEnable = tc.mock
			opts := RunOpts{
				Args: []string{
					"testdata",
				},
				Command: "ls",
				Group:   tc.group,
				User:    tc.user,
				WorkDir: "./",
			}

			if tc.stdout {
				opts.Stderr = logger.Stderr
				opts.Stdout = logger.Stdout
			}

			o, err := c.Run(ctx, opts)

			assert.Equal(t, err != nil, tc.wantErr)

			s := CmdOutput(logger.ReadStd())

			if tc.stdout {
				assert.Equal(t, s, tc.wantOutput)
			} else {
				assert.Equal(t, o, tc.wantOutput)
			}
		})
	}

	// Test environment
	c.runMockEnable = false
	opts := RunOpts{
		Command: "/usr/bin/printenv",
		Environment: []string{
			"hello=world",
		},
	}
	o, err := c.Run(ctx, opts)
	assert.HasErr(t, err, nil)
	assert.Contains(t, o.String(), "hello=world")
	assert.Equal(t, strings.Contains(o.String(), "PATH="), false)

	opts.EnvironmentInherit = true
	o, err = c.Run(ctx, opts)
	assert.HasErr(t, err, nil)
	assert.Contains(t, o.String(), "hello=world")
	assert.Equal(t, strings.Contains(o.String(), "PATH="), true)

	assert.Equal(t, c.RunMockInputs(), []RunMockInput{
		{
			Exec:    "/usr/bin/ls testdata",
			WorkDir: "./",
		},
		{
			Exec:    "/usr/bin/ls testdata",
			WorkDir: "./",
		},
		{
			Exec:    "/usr/bin/ls testdata",
			GID:     uint32(gid),
			UID:     uint32(uid),
			WorkDir: "./",
		},
		{
			Exec:    "/usr/bin/ls testdata",
			GID:     uint32(gid),
			UID:     uint32(uid),
			WorkDir: "./",
		},
	})

	c.RunMock()
	c.Run(ctx, RunOpts{
		Args:                []string{"${world}"},
		Command:             "hello",
		ContainerImage:      "example",
		ContainerNetwork:    "test",
		ContainerPrivileged: true,
		ContainerVolumes: []string{
			"/a:/a",
			"/b:/b",
		},
		ContainerWorkDir: "/test1",
		WorkDir:          "/test2",
	})

	cri, _ := GetContainerRuntime()

	assert.Equal(t, c.runMock.inputs[0].Exec, fmt.Sprintf("/usr/bin/%s run -i --rm --network test --privileged -v /a:/a -v /b:/b -w /test1 example hello ${world}", cri))
	assert.Equal(t, c.runMock.inputs[0].WorkDir, "/test2")

	c.runMockEnable = false

	out, err := c.Run(ctx, RunOpts{
		Command: "cat",
		Stdin:   bytes.NewBufferString("hello"),
	})
	assert.Equal(t, out, "hello")
	assert.HasErr(t, err, nil)

	// Test environment evaluate
	t.Setenv("hello", "world")

	out, err = c.Run(ctx, RunOpts{
		Args:    []string{"${arg}"},
		Command: "cat",
		Environment: []string{
			"arg=-b",
		},
		EnvironmentInherit: true,
		Stdin:              bytes.NewBufferString("what in the ${hello}"),
	})
	assert.HasErr(t, err, nil)
	assert.Equal(t, out, "     1	what in the world")
}
