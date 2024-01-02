package jsonnet

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"os"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/get"
	"github.com/candiddev/shared/go/logger"
	"github.com/candiddev/shared/go/types"
	"github.com/google/go-jsonnet"
	"github.com/google/go-jsonnet/ast"
)

var ErrRender = errors.New("error rendering jsonnet")

// Render is a jsonnet renderer.
type Render struct {
	env     *[]string
	imports *Imports
	path    string
	vm      *jsonnet.VM
}

// NewRender returns a jsonnet renderer.
func NewRender(ctx context.Context, config any) *Render { //nolint:gocognit,gocyclo
	cache := map[string]any{}
	r := &Render{
		vm: jsonnet.MakeVM(),
	}

	r.vm.NativeFunction(&jsonnet.NativeFunction{
		Func: func(params []any) (any, error) {
			out, err := json.Marshal(config)
			if err != nil {
				return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("error marshaling config"), err))
			}

			var m map[string]any

			if err := json.Unmarshal(out, &m); err != nil {
				return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("error unmarshaling config"), err))
			}

			return m, nil
		},
		Name: "getConfig",
	})
	r.vm.NativeFunction(&jsonnet.NativeFunction{
		Func: func(params []any) (any, error) {
			var key string

			var ok bool

			v := ""

			if key, ok = params[0].(string); ok {
				if r.env == nil {
					v = os.Getenv(key)
				} else {
					for _, e := range *r.env {
						if s := strings.Split(e, "="); len(s) == 2 && s[0] == key {
							v = s[1]

							break
						}
					}
				}

				if v != "" {
					return v, nil
				}
			}

			if v == "" && len(params) == 2 && params[1] != nil {
				return params[1], nil
			}

			return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(fmt.Errorf("no value found for %s and no fallback provided", key)))
		},
		Name:   "getEnv",
		Params: ast.Identifiers{"key", "fallback"},
	})
	r.vm.NativeFunction(&jsonnet.NativeFunction{
		Func: func(params []any) (any, error) {
			if path, ok := params[0].(string); ok {
				if v, ok := cache["getFile_"+path]; ok {
					return v, nil
				}

				b := &bytes.Buffer{}

				_, err := get.File(ctx, path, b, time.Time{})
				if err != nil {
					if len(params) == 2 && params[1] != nil {
						return params[1], nil
					}

					return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("error getting value"), err))
				}

				s := strings.TrimSpace(b.String())

				cache["getFile"+path] = s

				return s, nil
			}

			return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("no path provided")))
		},
		Name:   "getFile",
		Params: ast.Identifiers{"path", "fallback"},
	})
	r.vm.NativeFunction(&jsonnet.NativeFunction{
		Func: func(params []any) (any, error) {
			return r.path, nil
		},
		Name: "getPath",
	})
	r.vm.NativeFunction(&jsonnet.NativeFunction{
		Func: func(params []any) (any, error) {
			t, ok := params[0].(string)
			if !ok {
				return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("no type provided")))
			}

			n, ok := params[1].(string)
			if !ok {
				return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("no hostname provided")))
			}

			c := fmt.Sprintf("getRecord_%s_%s", t, n)

			if v, ok := cache[c]; ok {
				return v, nil
			}

			var err error

			var r []string

			switch strings.ToLower(t) {
			case "a":
				r, err = net.LookupHost(n)

				filter := []string{}
				for i := range r {
					if strings.Contains(r[i], ".") {
						filter = append(filter, r[i])
					}
				}

				r = filter
			case "aaaa":
				r, err = net.LookupHost(n)

				filter := []string{}
				for i := range r {
					if strings.Contains(r[i], ":") {
						filter = append(filter, r[i])
					}
				}

				r = filter
			case "cname":
				var s string

				s, err = net.LookupCNAME(n)
				r = []string{s}
			case "txt":
				r, err = net.LookupTXT(n)
			default:
				err = fmt.Errorf("unknown type: %s", strings.ToLower(t))
			}

			if err != nil {
				if len(params) == 3 && params[2] != nil {
					return params[2], nil
				}

				return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("error resolving record"), err))
			}

			a := []any{}

			sort.Strings(r)

			for i := range r {
				a = append(a, r[i])
			}

			cache[c] = a

			return a, nil
		},
		Name:   "getRecord",
		Params: ast.Identifiers{"type", "name", "fallback"},
	})
	r.vm.NativeFunction(&jsonnet.NativeFunction{
		Func: func(params []any) (any, error) {
			length, ok := params[0].(float64)
			if !ok {
				return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("no length provided")))
			}

			return types.RandString(int(length)), nil
		},
		Name:   "randStr",
		Params: ast.Identifiers{"length"},
	})
	r.vm.NativeFunction(&jsonnet.NativeFunction{
		Func: func(params []any) (any, error) {
			reg, ok := params[0].(string)
			if !ok {
				return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("no regex provided")))
			}

			s, ok := params[1].(string)
			if !ok {
				return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("no string provided")))
			}

			rx, e := regexp.Compile(reg)
			if e != nil {
				return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(e))
			}

			return rx.MatchString(s), nil
		},
		Name:   "regexMatch",
		Params: ast.Identifiers{"regex", "string"},
	})
	r.vm.NativeFunction(&jsonnet.NativeFunction{
		Func: func(params []any) (any, error) {
			s, ok := params[0].(string)
			if !ok {
				return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("no string provided")))
			}

			r := NewRender(ctx, config)
			r.Import(r.GetString(s))

			m := map[string]any{}
			if err := r.Render(ctx, &m); err != nil {
				return nil, logger.Error(ctx, err)
			}

			return m, nil
		},
		Name:   "render",
		Params: ast.Identifiers{"string"},
	})
	r.vm.SetTraceOut(logger.Stderr)

	return r
}

// SetEnv sets a custom Env list for getEnv.
func (r *Render) SetEnv(env *[]string) {
	r.env = env
}

// Render evaluates the main.jsonnet file onto a dest.
func (r *Render) Render(ctx context.Context, dest any) errs.Err {
	if r.imports == nil {
		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrRender, fmt.Errorf("render doesn't have any imports, call Import() first")))
	}

	s, err := r.vm.EvaluateFile(r.imports.Entrypoint)
	if err != nil {
		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrRender), err.Error())
	}

	if err := json.Unmarshal([]byte(s), dest); err != nil {
		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrRender), err.Error())
	}

	return nil
}
