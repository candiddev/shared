package config

import (
	"context"
	"errors"

	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/logger"
)

var ErrUpdateArg = errors.New("error updating config from argument")

func getArgs(ctx context.Context, config any, args []string) errs.Err {
	if err := ParseValues(ctx, config, "", args); err != nil {
		return logger.Error(ctx, errs.ErrReceiver.Wrap(ErrUpdateArg, err))
	}

	return logger.Error(ctx, nil)
}
