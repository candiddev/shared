package cli

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/candiddev/shared/go/config"
	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/logger"
	"github.com/candiddev/shared/go/types"
)

// Print takes any input, marshals to JSON, and prints it to stdout.
func Print(out any) errs.Err {
	o, err := json.MarshalIndent(out, "", "  ")
	if err != nil {
		return errs.ErrReceiver.Wrap(errors.New("error printing"), err)
	}

	logger.Raw(string(o) + "\n")

	return nil
}

func printConfig[T AppConfig[any]](ctx context.Context, a App[T]) errs.Err {
	out, err := config.Mask(ctx, a.Config, a.HideConfigFields)
	if err != nil {
		return logger.Error(ctx, err)
	}

	logger.Info(logger.SetFormat(ctx, logger.FormatRaw), types.JSONToString(out))

	return logger.Error(ctx, nil)
}
