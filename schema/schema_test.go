package schema

import (
	"testing"

	"github.com/candiddev/shared/go/cli"
)

type root struct {
	A a `json:"a"`
}

type a struct {
	B b
}

type b struct {
	Value string `json:"value" usage:"Hello world"`
}

func TestGet(t *testing.T) {
	cli.Print(Get(root{
		A: a{
			B: b{
				Value: "default",
			},
		},
	}, "http://example.com", "Example"))
}
