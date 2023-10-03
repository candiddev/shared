package jsonnet

import (
	"context"
)

type testdata struct {
	String string
	Bool   bool
	Int    int
}

var ctx = context.Background()
