package config

import (
	"context"
	"encoding/json"
	"errors"
	"strings"

	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/logger"
)

var ErrRender = errors.New("error rendering config")

func maskMap(m map[string]any, field string) {
	path := strings.Split(field, ".")

	if len(path) == 1 {
		delete(m, path[0])

		return
	} else if v, ok := m[path[0]].(map[string]any); ok && len(path) > 1 {
		maskMap(v, strings.Join(path[1:], "."))
	}
}

func Mask(ctx context.Context, c any, fields []string) (map[string]any, errs.Err) {
	var out map[string]any

	j, err := json.Marshal(c)
	if err != nil {
		return out, logger.Error(ctx, errs.ErrReceiver.Wrap(ErrRender, err))
	}

	err = json.Unmarshal(j, &out)
	if err != nil {
		return out, logger.Error(ctx, errs.ErrReceiver.Wrap(ErrRender, err))
	}

	for i := range fields {
		maskMap(out, fields[i])
	}

	return out, logger.Error(ctx, nil)
}
