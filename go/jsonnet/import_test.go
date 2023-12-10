package jsonnet

import (
	"os"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/logger"
)

type config struct {
	Vars map[string]any
}

func TestImportsEqual(t *testing.T) {
	i1 := &Imports{
		Files: map[string]string{
			"hello": "world",
			"yes":   "no",
		},
	}
	i2 := &Imports{
		Files: map[string]string{
			"yes":   "no",
			"hello": "world",
		},
	}

	assert.Equal(t, i1.Diff("", "", i2) == "", true)
	assert.Equal(t, i1.Diff("a", "b", i2) == "", true)

	assert.Equal(t, i1.Diff("", "", nil) == "", false)
	i1.Files["test"] = "yes"
	assert.Equal(t, i1.Diff("a", "b", i2) == "", false)

	delete(i1.Files, "test")
	i1.Files["hello"] = "person"
	assert.Equal(t, i1.Diff("c", "d", i2) == "", false)

	delete(i1.Files, "hello")
	i1.Files["hello"] = "person"
	assert.Equal(t, i1.Diff("e", "f", i2) == "", false)
}

func TestGetPath(t *testing.T) {
	ctx := logger.UseTestLogger(t)

	c := config{
		Vars: map[string]any{
			"hello": "world",
		},
	}

	importFunc, _ := os.ReadFile("testdata/imports/func.libsonnet")
	importText, _ := os.ReadFile("testdata/imports/text.txt")
	goodJsonnet, _ := os.ReadFile("testdata/good.jsonnet")
	goodJson, _ := os.ReadFile("testdata/good.json") //nolint:revive,stylecheck
	otherDirMore, _ := os.ReadFile("testdata/otherDir/more.txt")

	tests := map[string]struct {
		path    string
		wantOut *Imports
		wantErr error
	}{
		"bad path": {
			path:    "notreal",
			wantErr: errs.ErrReceiver,
		},
		"bad imports": {
			path:    "testdata/failimport.jsonnet",
			wantErr: errs.ErrReceiver,
		},
		"good jsonnet": {
			path: "testdata/good.jsonnet",
			wantOut: &Imports{
				Entrypoint: "/testdata/good.jsonnet",
				Files: map[string]string{
					"/native.libsonnet":                Native,
					"/testdata/imports/func.libsonnet": string(importFunc),
					"/testdata/imports/text.txt":       string(importText),
					"/testdata/good.jsonnet":           string(goodJsonnet),
					"/testdata/otherDir/more.txt":      string(otherDirMore),
				},
			},
		},
		"good json": {
			path: "testdata/good.json",
			wantOut: &Imports{
				Entrypoint: "/good.json",
				Files: map[string]string{
					"/good.json": string(goodJson),
				},
			},
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			r := NewRender(ctx, c)
			i, err := r.GetPath(ctx, tc.path)
			assert.HasErr(t, err, tc.wantErr)

			if err == nil {
				assert.Equal(t, i, tc.wantOut)
			}
		})
	}
}

func TestGetString(t *testing.T) {
	ctx := logger.UseTestLogger(t)

	c := config{
		Vars: map[string]any{
			"hello": "world",
		},
	}

	r := NewRender(ctx, &c)
	s := `{
	hello: "world"
}`

	assert.Equal(t, r.GetString(s), &Imports{
		Entrypoint: "main.jsonnet",
		Files: map[string]string{
			"main.jsonnet": s,
		},
	})
}
