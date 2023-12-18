package config

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/jsonnet"
	"github.com/candiddev/shared/go/logger"
)

func GetFile(ctx context.Context, config any, path string) errs.Err {
	if path != "" {
		r := jsonnet.NewRender(ctx, config)

		path = FindPathAscending(ctx, path)
		if path == "" {
			return nil
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

// FindPathAscending looks for a filename in every parent directory.
func FindPathAscending(ctx context.Context, path string) string {
	if !strings.HasPrefix(path, "./") && filepath.Dir(path) != "." {
		return path
	}

	wd, e := os.Getwd()
	if e != nil {
		logger.Debug(ctx, fmt.Sprintf("error retrieving current directory: %s", e))

		return ""
	}

	if strings.HasPrefix(path, "./") {
		return filepath.Join(wd, path)
	}

	for {
		path := filepath.Join(wd, path)

		_, e = os.ReadFile(path)
		if e == nil {
			logger.Debug(ctx, "Using "+path)

			return path
		} else if wd == "/" {
			break
		}

		wd = filepath.Dir(wd)
	}

	logger.Debug(ctx, "No files found with name "+path)

	return ""
}
