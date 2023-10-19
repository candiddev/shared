package jwt

import (
	"encoding/json"
	"strconv"
	"strings"
)

// RegisteredClaims are default fields in a JWT.
type RegisteredClaims struct {
	Audience  Audience `json:"aud,omitempty"`
	ExpiresAt int64    `json:"exp,omitempty"`
	ID        string   `json:"jti,omitempty"`
	IssuedAt  int64    `json:"iat,omitempty"`
	Issuer    string   `json:"iss,omitempty"`
	NotBefore int64    `json:"nbf,omitempty"`
	Subject   string   `json:"sub,omitempty"`
}

// CustomClaims is a struct that can be parsed from a JWT payload.
type CustomClaims interface {
	GetRegisteredClaims() *RegisteredClaims
	Valid() error
}

// Audience is a string or array of strings.
type Audience []string

func (a Audience) MarshalJSON() ([]byte, error) {
	switch {
	case len(a) == 0:
		return nil, nil
	case len(a) == 1:
		return []byte(strconv.Quote(a[0])), nil
	}

	return json.Marshal([]string(a))
}

func (a *Audience) UnmarshalJSON(data []byte) error {
	if data == nil {
		return nil
	}

	str := string(data)

	if !strings.HasPrefix(str, "[") {
		str = "[" + str + "]"
	}

	as := []string{}
	if err := json.Unmarshal([]byte(str), &as); err != nil {
		return err
	}

	*a = Audience(as)

	return nil
}
