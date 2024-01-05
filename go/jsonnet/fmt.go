package jsonnet

import (
	"context"
	"errors"
	"path/filepath"

	"github.com/candiddev/shared/go/diff"
	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/logger"
	"github.com/candiddev/shared/go/types"
	"github.com/google/go-jsonnet/formatter"
)

var ErrFmt = errors.New("files not formatted properly")

// Fmt compares the formatting and prints out a diff if a file isn't formatted properly.
func (r *Render) Fmt(ctx context.Context) (types.Results, errs.Err) {
	res := types.Results{}

	for i := range r.imports.Files {
		s, err := formatter.Format(i, r.imports.Files[i], formatter.DefaultOptions())
		if err != nil {
			return nil, logger.Error(ctx, errs.ErrReceiver.Wrap(ErrFmt, err))
		}

		if s != r.imports.Files[i] {
			p := filepath.Join(r.path, i)
			res[p] = append(res[p], string(diff.Diff("have "+i, []byte(r.imports.Files[i]), "want "+i, []byte(s))))
		}
	}

	return res, logger.Error(ctx, nil)
}
