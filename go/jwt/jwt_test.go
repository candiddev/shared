package jwt

import (
	"time"
)

type jwtCustom struct {
	Licensed     bool
	Name         string `json:"name"`
	LastPurchase time.Time
}
