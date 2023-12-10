package jsonnet

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/logger"
	"github.com/candiddev/shared/go/types"
)

func TestLint(t *testing.T) {
	ctx := logger.UseTestLogger(t)

	c := config{}

	tests := map[string]struct {
		checkFormat    bool
		path           string
		wantErr        error
		wantImportsLen int
		wantResults    types.Results
	}{
		"bad_path": {
			path:    "/notathing",
			wantErr: errs.ErrReceiver,
		},
		"good_dir": {
			path:           "testdata",
			wantImportsLen: 4,
			wantResults: types.Results{
				"testdata/failimport.jsonnet": {"error importing jsonnet files: RUNTIME ERROR: couldn't open import \"failimport.libsonnet\": no match locally or in the Jsonnet library paths\n\ttestdata/failimport.jsonnet:1:14-43"},
				"testdata/funcs.jsonnet":      {"error importing jsonnet files: RUNTIME ERROR: couldn't open import \"../functions.libsonnet\": no match locally or in the Jsonnet library paths\n\ttestdata/funcs.jsonnet:1:14-45"},
			},
		},
		"good_path": {
			path: "testdata/funcs.jsonnet",
			wantResults: types.Results{
				"testdata/funcs.jsonnet": {"error importing jsonnet files: RUNTIME ERROR: couldn't open import \"../functions.libsonnet\": no match locally or in the Jsonnet library paths\n\ttestdata/funcs.jsonnet:1:14-45"},
			},
		},
		"native": {
			checkFormat:    true,
			path:           "native.libsonnet",
			wantImportsLen: 1,
			wantResults:    types.Results{},
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			r, i, err := Lint(ctx, c, tc.path, tc.checkFormat)
			assert.HasErr(t, err, tc.wantErr)
			assert.Equal(t, r, tc.wantResults)
			assert.Equal(t, len(i), tc.wantImportsLen)
		})
	}
}
