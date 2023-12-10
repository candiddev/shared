package jsonnet

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/logger"
	"github.com/google/go-jsonnet/formatter"
)

func Convert(ctx context.Context, input any) (string, errs.Err) {
	j, err := json.MarshalIndent(input, "", "  ")
	if err != nil {
		return "", logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("error rendering json"), err))
	}

	s, err := formatter.Format("", string(j), formatter.DefaultOptions())
	if err != nil {
		return "", logger.Error(ctx, errs.ErrReceiver.Wrap(errors.New("error rendering jsonnet"), err))
	}

	return s, logger.Error(ctx, nil)
}
