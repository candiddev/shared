package config

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/jsonnet"
	"github.com/candiddev/shared/go/logger"
)

func GetFile(ctx context.Context, config any, path string) errs.Err {
	if path != "" {
		r := jsonnet.NewRender(ctx, config)

		if filepath.Base(path) == path {
			path = FindFilenameAscending(ctx, path)

			if path == "" {
				return nil
			}
		}

		i, err := r.GetPath(ctx, path)
		if err != nil {
			return logger.Error(ctx, err)
		}

		r.Import(i)

		if err := r.Render(ctx, config); err != nil {
			return logger.Error(ctx, err)
		}
	}

	return logger.Error(ctx, nil)
}

// FindFilenameAscending looks for a filename in every parent directory.
func FindFilenameAscending(ctx context.Context, filename string) (path string) {
	wd, e := os.Getwd()
	if e != nil {
		logger.Debug(ctx, fmt.Sprintf("error retreiving current directory: %s", e))

		return ""
	}

	for {
		path := filepath.Join(wd, filename)

		_, e = os.ReadFile(path)
		if e == nil {
			logger.Debug(ctx, "Using "+path)

			return path
		} else if wd == "/" {
			break
		}

		wd = filepath.Dir(wd)
	}

	logger.Debug(ctx, "No files found with name "+filename)

	return ""
}
