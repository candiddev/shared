package jsonnet

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/logger"
	"github.com/candiddev/shared/go/types"
)

func TestFmt(t *testing.T) {
	ctx := logger.UseTestLogger(t)
	ctx = logger.SetFormat(ctx, logger.FormatHuman)

	tests := map[string]struct {
		imports *Imports
		wantErr error
		wantRes types.Results
	}{
		"bad can't parse": {
			imports: &Imports{
				Files: map[string]string{
					"main.jsonnet": `THIS IS NONSENSE
				`,
				},
			},
			wantErr: ErrFmt,
		},
		"bad": {
			imports: &Imports{
				Files: map[string]string{
					"main.jsonnet": `
{
	hello: "world"
}
				`,
				},
			},
			wantRes: types.Results{
				"main.jsonnet": []string{`diff have main.jsonnet want main.jsonnet
--- have main.jsonnet
+++ want main.jsonnet
@@ -1,5 +1,3 @@
-
 {
-	hello: "world"
+  hello: 'world',
 }
-				
\ No newline at end of file
`,
				},
			},
		},
		"good": {
			imports: &Imports{
				Files: map[string]string{
					"a.jsonnet": `{
  hello: 'world',
}
`,
				},
			},
			wantRes: types.Results{},
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			logger.SetStd()
			r := NewRender(ctx, nil)
			r.Import(tc.imports)
			res, err := r.Fmt(ctx)
			assert.HasErr(t, err, tc.wantErr)
			assert.Equal(t, res, tc.wantRes)
		})
	}
}
