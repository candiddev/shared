package cli

import (
	"bytes"
	"context"
	"errors"
	"flag"
	"fmt"
	"io"
	"os"
	"os/exec"
	osuser "os/user"
	"strconv"
	"strings"
	"sync"
	"syscall"

	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/logger"
)

// ContainerRuntime is an enum for determining which runtime to use.
type ContainerRuntime string

// ContainerRuntime is an enum for determining which runtime to use.
const (
	ContainerRuntimeNone   ContainerRuntime = ""
	ContainerRuntimeDocker ContainerRuntime = "docker"
	ContainerRuntimePodman ContainerRuntime = "podman"
)

var (
	ErrRun                  = errors.New("error running commands")
	ErrRunUnterminatedQuote = errors.New("unterminated quote in arguments")
	ErrRunLookupGroup       = errors.New("error looking up group")
	ErrRunLookupUser        = errors.New("error looking up user")
)

// CmdOutput is a string of the command exec output.
type CmdOutput string

func (c CmdOutput) String() string {
	if c != "" {
		return strings.TrimSpace(string(c))
	}

	return ""
}

// GetContainerRuntime returns the detected ContainerRuntime.
func GetContainerRuntime() (ContainerRuntime, error) {
	_, err := exec.LookPath("docker")
	if err != nil {
		_, err := exec.LookPath("podman")
		if err != nil {
			return ContainerRuntimeNone, errors.New("no container runtime found")
		}

		return ContainerRuntimePodman, nil
	}

	return ContainerRuntimeDocker, nil
}

func parseArgs(args []string) ([]string, error) {
	o := []string{}
	quote := ""
	text := ""

	for _, a := range args {
		if a == "" {
			continue
		}

		switch {
		// In a quote
		case quote != "":
			if strings.HasSuffix(a, quote) { // Quote end
				o = append(o, text+" "+a[:len(a)-1])
				quote = ""
				text = ""
			} else { // Quote continue
				text += " " + a
			}
		// Begin quote
		case strings.HasPrefix(a, `"`) || strings.HasPrefix(a, "'"):
			quote = string(a[0])
			text += a[1:]
		// No quote
		case quote == "":
			o = append(o, a)
		}
	}

	if quote != "" {
		return nil, fmt.Errorf("%w: %s", ErrRunUnterminatedQuote, quote)
	}

	return o, nil
}

// RunOpts are options for running a CLI command.
type RunOpts struct {
	Args                []string
	Command             string
	ContainerEntrypoint string
	ContainerImage      string
	ContainerNetwork    string
	ContainerPull       string
	ContainerPrivileged bool
	ContainerUser       string
	ContainerVolumes    []string
	ContainerWorkDir    string
	Environment         []string
	EnvironmentInherit  bool
	Group               string
	NoErrorLog          bool
	Stdin               string
	Stderr              io.Writer
	Stdout              io.Writer
	User                string
	WorkDir             string
}

func (r *RunOpts) getCmd(ctx context.Context) (*exec.Cmd, []string, errs.Err) {
	var args []string

	var cmd string

	if r.ContainerImage == "" {
		cmd = r.Command
		args = r.Args
	} else {
		cri, err := GetContainerRuntime()
		if err != nil {
			return nil, nil, errs.ErrReceiver.Wrap(err)
		}

		if cri != "" {
			cmd = string(cri)
			args = []string{"run", "-i", "--rm"}

			if len(r.Environment) > 0 {
				for i := range r.Environment {
					args = append(args, "-e", r.Environment[i])
				}
			}

			if r.ContainerEntrypoint != "" {
				args = append(args, "--entrypoint", r.ContainerEntrypoint)
			}

			if r.ContainerNetwork != "" {
				args = append(args, "--network", r.ContainerNetwork)
			}

			if r.ContainerPrivileged {
				args = append(args, "--privileged")
			}

			if r.ContainerPull != "" {
				args = append(args, "--pull", r.ContainerPull)
			}

			if r.ContainerUser != "" {
				args = append(args, "-u", r.ContainerUser)
			}

			for i := range r.ContainerVolumes {
				args = append(args, "-v", r.ContainerVolumes[i])
			}

			if r.ContainerWorkDir != "" {
				args = append(args, "-w", r.ContainerWorkDir)
			}

			args = append(args, r.ContainerImage)

			if r.Command != "" {
				args = append(args, r.Command)
			}

			args = append(args, r.Args...)
		}
	}

	env := []string{}

	if r.EnvironmentInherit {
		env = os.Environ()
	}

	env = append(env, r.Environment...)

	// Parse quotes
	a, err := parseArgs(args)
	if err != nil {
		return nil, nil, errs.ErrReceiver.Wrap(err)
	}

	return exec.CommandContext(ctx, cmd, a...), env, nil
}

// GetGID takes a group identifier string and returns an gid or error.
func GetGID(group string) (uint32, error) {
	g, err := strconv.ParseUint(group, 10, 32)
	if err != nil {
		gu, err := osuser.LookupGroup(group)
		if err != nil {
			return 0, fmt.Errorf("%w: %s: %w", ErrRunLookupGroup, group, err)
		}

		g, err = strconv.ParseUint(gu.Gid, 10, 32)
		if err != nil {
			return 0, fmt.Errorf("%w: %s: %w", ErrRunLookupGroup, group, err)
		}
	}

	return uint32(g), nil
}

// GetUID takes a user identifier string and returns a uid or error.
func GetUID(user string) (uint32, error) {
	o, err := strconv.ParseUint(user, 10, 32)
	if err != nil {
		u, err := osuser.Lookup(user)
		if err != nil {
			return 0, fmt.Errorf("%w: %s: %w", ErrRunLookupUser, user, err)
		}

		o, err = strconv.ParseUint(u.Uid, 10, 32)
		if err != nil {
			return 0, fmt.Errorf("%w: %s: %w", ErrRunLookupUser, user, err)
		}
	}

	return uint32(o), nil
}

// Run uses RunOpts to run CLI commands.
func (c *Config) Run(ctx context.Context, opts RunOpts) (out CmdOutput, err errs.Err) { //nolint:gocognit
	cmd, env, err := opts.getCmd(ctx)
	if err != nil {
		return "", logger.Error(ctx, errs.ErrReceiver.Wrap(err))
	}

	if opts.Stdin == "" {
		cmd.Stdin = os.Stdin
	} else {
		cmd.Stdin = bytes.NewBufferString(opts.Stdin)
	}

	cmd.Env = env

	var e error

	creds := &syscall.Credential{}

	if opts.Group != "" {
		gid, e := GetGID(opts.Group)
		if e != nil {
			return "", logger.Error(ctx, errs.ErrReceiver.Wrap(e))
		}

		creds.Gid = gid

		if opts.User == "" {
			creds.Uid = uint32(os.Getuid())
		}
	}

	if opts.User != "" {
		uid, e := GetUID(opts.User)
		if e != nil {
			return "", logger.Error(ctx, errs.ErrReceiver.Wrap(e))
		}

		creds.Uid = uid

		if opts.Group == "" {
			creds.Gid = uint32(os.Getgid())
		}
	}

	if opts.Group != "" || opts.User != "" {
		cmd.SysProcAttr = &syscall.SysProcAttr{
			Credential: creds,
		}
	}

	cmd.Dir = opts.WorkDir

	logger.Debug(ctx, "Running commands:\n"+cmd.String())

	var o []byte

	if c.runMockEnable {
		c.runMockLock()

		if len(c.runMock.errs) > 0 {
			e = c.runMock.errs[0]
		}

		if len(c.runMock.outputs) > 0 {
			o = []byte(c.runMock.outputs[0])
		}

		if len(c.runMock.errs) > 0 {
			c.runMock.errs = c.runMock.errs[1:]
		} else {
			c.runMock.errs = nil
		}

		gid := uint32(0)
		uid := uint32(0)

		if cmd.SysProcAttr != nil && cmd.SysProcAttr.Credential != nil {
			gid = cmd.SysProcAttr.Credential.Gid
			uid = cmd.SysProcAttr.Credential.Uid
		}

		c.runMock.inputs = append(c.runMock.inputs, RunMockInput{
			Environment: opts.Environment,
			Exec:        cmd.String(),
			GID:         gid,
			UID:         uid,
			WorkDir:     opts.WorkDir,
		})

		if len(c.runMock.outputs) > 0 {
			c.runMock.outputs = c.runMock.outputs[1:]
		} else {
			c.runMock.outputs = nil
		}

		c.runMock.mutex.Unlock()
	} else {
		if opts.Stderr != nil && opts.Stdout != nil {
			cmd.Stdout = opts.Stdout
			cmd.Stderr = opts.Stderr
			e = cmd.Run()
		} else {
			o, e = cmd.CombinedOutput()
		}
	}

	out = CmdOutput(o)

	if e != nil {
		err := errs.ErrReceiver.Wrap(ErrRun, e)

		if !opts.NoErrorLog {
			logger.Error(ctx, err, out.String()) //nolint:errcheck
		}

		return CmdOutput(o), err
	}

	return out, logger.Error(ctx, err, out.String())
}

// RunMockInput is a log of things that were inputted into the RunMock.
type RunMockInput struct {
	Environment []string
	Exec        string
	GID         uint32
	UID         uint32
	WorkDir     string
}

// RunMock makes the CLI Run use a mock.
func (c *Config) RunMock() {
	c.runMockEnable = true
	c.runMock = &runMock{}
}

// RunMockErrors sets errors to respond to a CLI Run command.
func (c *Config) RunMockErrors(err []error) {
	c.runMockLock()
	c.runMock.errs = err
	c.runMock.mutex.Unlock()
}

// RunMockInputs returns a list of RunMockInputs.
func (c *Config) RunMockInputs() []RunMockInput {
	c.runMockLock()
	defer c.runMock.mutex.Unlock()

	i := c.runMock.inputs

	c.runMock.inputs = nil

	return i
}

// RunMockOutputs sets the outputs to respond to a CLI Run command.
func (c *Config) RunMockOutputs(outputs []string) {
	c.runMockLock()
	c.runMock.outputs = outputs
	c.runMock.mutex.Unlock()
}

func (c *Config) runMockLock() {
	if c.runMock.mutex == nil {
		c.runMock.mutex = &sync.Mutex{}
	}

	c.runMock.mutex.Lock()
}

// RunMain wraps a main function with args to parse the output.
func RunMain(m func() errs.Err, stdin string, args ...string) (string, errs.Err) {
	os.Args = append([]string{""}, args...)

	SetStdin(stdin)
	logger.SetStd()

	flag.CommandLine = flag.NewFlagSet(os.Args[0], flag.ExitOnError)

	err := m()

	return strings.TrimSpace(logger.ReadStd()), err
}
