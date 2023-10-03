package jsonnet

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/logger"
)

func TestFmt(t *testing.T) {
	logger.NoColor()

	tests := map[string]struct {
		imports    *Imports
		wantOutput string
		wantErr    error
	}{
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
			wantOutput: `ERROR shared/go/jsonnet/fmt.go:36
files not formatted properly
diff have main.jsonnet want main.jsonnet
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
			wantErr: ErrFmt,
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
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			logger.SetStd()
			r := NewRender(ctx, nil)
			r.Import(tc.imports)
			assert.HasErr(t, r.Fmt(ctx), tc.wantErr)
			assert.Equal(t, logger.ReadStd(), tc.wantOutput)
		})
	}
}
