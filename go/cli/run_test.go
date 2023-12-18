package cli

import (
	"context"
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/logger"
)

func TestRun(t *testing.T) {
	logger.UseTestLogger(t)

	ctx := context.Background()
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
		streamLogs bool
		user       string
		wantErr    bool
		wantOutput CmdOutput
	}{
		{
			name:       "real",
			streamLogs: true,
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

			o, err := c.Run(ctx, RunOpts{
				Args: []string{
					"testdata",
				},
				Command:    "ls",
				Group:      tc.group,
				StreamLogs: tc.streamLogs,
				User:       tc.user,
				WorkDir:    "./",
			})

			assert.Equal(t, err != nil, tc.wantErr)

			if tc.streamLogs {
				assert.Equal(t, logger.ReadStd(), string(tc.wantOutput))
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
		Args: []string{
			"world",
		},
		Command:             "hello",
		ContainerImage:      "example",
		ContainerPrivileged: true,
		ContainerVolumes: []string{
			"/a:/a",
			"/b:/b",
		},
		ContainerWorkDir: "/test1",
		WorkDir:          "/test2",
	})

	cri, _ := getContainerRuntime()

	assert.Equal(t, regexp.MustCompile(fmt.Sprintf(`^/usr/bin/%s run -i --rm --name etcha_\S+ --privileged -v /a:/a -v /b:/b -w /test1 example hello world$`, cri)).MatchString(c.runMock.inputs[0].Exec), true)
	assert.Equal(t, c.runMock.inputs[0].WorkDir, "/test2")

	c.runMockEnable = false

	out, err := c.Run(ctx, RunOpts{
		Command: "cat",
		Stdin:   "hello",
	})
	assert.Equal(t, out, "hello")
	assert.HasErr(t, err, nil)
}
