package notify

import (
	"context"
	"os"
	"testing"

	"github.com/candiddev/shared/go/logger"
	"github.com/candiddev/shared/go/metrics"
)

type notifyConfig struct {
	SMTP    SMTP    `json:"smtp"`
	WebPush WebPush `json:"webPush"`
}

var ctx context.Context

var c *notifyConfig

func TestMain(m *testing.M) {
	ctx = context.Background()
	c = &notifyConfig{}
	c.SMTP.ReplyTo = "test@homechart.app"

	metrics.Setup("homechart")

	ctx = logger.SetLevel(ctx, logger.LevelDebug)
	r := m.Run()
	os.Exit(r)
}
