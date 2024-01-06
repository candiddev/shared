package schema

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
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
	assert.Equal(t, Get(root{
		A: a{
			B: b{
				Value: "default",
			},
		},
	}), &Schema{
		"a": &Schema{
			"B": &Schema{
				"value":       "default",
				"value:usage": "Hello world",
			},
		},
	})

	cli.Print(Get(root{
		A: a{
			B: b{
				Value: "default",
			},
		},
	}))
}
