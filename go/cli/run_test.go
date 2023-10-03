package cli

import (
	"context"
	"fmt"
	"regexp"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/logger"
)

func TestRun(t *testing.T) {
	logger.UseTestLogger(t)

	ctx := context.Background()
	c := Config{}
	c.RunMock()
	c.RunMockErrors([]error{fmt.Errorf("hello"), nil})
	c.RunMockOutputs([]string{
		"a",
		"b",
	})

	tests := []struct {
		mock       bool
		name       string
		wantErr    bool
		wantOutput CmdOutput
	}{
		{
			name:       "real",
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
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			c.runMockEnable = tc.mock

			o, err := c.Run(ctx, RunOpts{
				Args: []string{
					"testdata",
				},
				Command: "ls",
				WorkDir: "./",
			})

			assert.Equal(t, err != nil, tc.wantErr)
			assert.Equal(t, o, tc.wantOutput)
		})
	}

	assert.Equal(t, c.RunMockInputs(), []RunMockInput{
		{
			Exec:    "/usr/bin/ls testdata",
			WorkDir: "./",
		},
		{
			Exec:    "/usr/bin/ls testdata",
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
		WorkDir: "/test",
	})

	cri, _ := getContainerRuntime()

	assert.Equal(t, regexp.MustCompile(fmt.Sprintf(`^/usr/bin/%s run -i --rm --name etcha_\S+ --privileged -v /a:/a -v /b:/b -w /test example hello world$`, cri)).MatchString(c.runMock.inputs[0].Exec), true)
	assert.Equal(t, c.runMock.inputs[0].WorkDir, "/test")

	c.runMockEnable = false

	out, err := c.Run(ctx, RunOpts{
		Command: "cat",
		Stdin:   "hello",
	})
	assert.Equal(t, out, "hello")
	assert.HasErr(t, err, nil)
}
