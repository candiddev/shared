package jsonnet

import (
	"context"
	"errors"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"

	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/logger"
	"github.com/candiddev/shared/go/types"
)

// LintImports is a map of imports returned by each lint path.
type LintImports map[string]*Imports

// Lint checks a path for Jsonnet errors and optionally format errors.
func Lint(ctx context.Context, config any, path string, checkFormat bool, exclude regexp.Regexp) (types.Results, LintImports, errs.Err) { //nolint:gocognit
	i := LintImports{}
	l := types.Results{}

	f, e := os.Stat(path)
	if e != nil {
		return nil, nil, logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("error opening path"), e))
	}

	lvl := logger.GetLevel(ctx)
	ctx = logger.SetLevel(ctx, logger.LevelNone)

	if f.IsDir() {
		if err := filepath.WalkDir(path, func(path string, d fs.DirEntry, err error) error {
			if exclude.String() != "" && exclude.MatchString(path) {
				return nil
			}

			if err == nil && !d.Type().IsDir() {
				if p := filepath.Ext(path); p != ".jsonnet" && p != ".libsonnet" {
					return nil
				}

				r := NewRender(ctx, config)
				ii, err := r.GetPath(ctx, path)
				if err != nil {
					l[path] = append(l[path], err.Error())

					return nil
				}

				r.Import(ii)
				i[filepath.Join(r.path, r.imports.Entrypoint)] = ii

				if checkFormat {
					res, err := r.Fmt(ctx)
					if err != nil {
						e := err.Error()
						match := false

						for i := range l[path] { // Iterate over error messages to avoid duplicates
							if l[path][i] == e {
								match = true

								break
							}
						}

						if !match {
							l[path] = append(l[path], err.Error())
						}
					}

					for k, v := range res {
						l[k] = append(l[k], v...)
					}
				}

				return nil
			}

			return err
		}); err != nil {
			return l, i, logger.Error(ctx, errs.ErrReceiver.Wrap(err))
		}
	} else if exclude.String() == "" || !exclude.MatchString(path) {
		r := NewRender(ctx, config)
		ii, err := r.GetPath(ctx, path)
		if err == nil {
			r.Import(ii)
			i[filepath.Join(r.path, r.imports.Entrypoint)] = ii

			if checkFormat {
				res, err := r.Fmt(ctx)
				if err != nil {
					l[path] = append(l[path], err.Error())
				} else {
					l = res
				}
			}
		} else {
			l[path] = append(l[path], err.Error())
		}
	}

	ctx = logger.SetLevel(ctx, lvl)

	return l, i, logger.Error(ctx, nil)
}
