package jsonnet

import (
	"net/http"
	"testing"
	"time"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/get"
	"github.com/candiddev/shared/go/logger"
)

func TestImportRender(t *testing.T) {
	logger.UseTestLogger(t)

	t.Setenv("hello", "world")

	c := config{
		Vars: map[string]any{
			"hello": "world",
		},
	}

	ts := get.NewHTTPMock([]string{"/test"}, []byte("Hello"), time.Time{})

	t.Setenv("ts", ts.URL())

	i, _ := NewRender(ctx, &c).GetPath(ctx, "testdata/good.jsonnet")

	tests := map[string]struct {
		config       any
		imports      *Imports
		wantErr      error
		wantOut      testdata
		wantRequests []get.HTTPMockRequest
	}{
		"bad import reference": {
			imports: &Imports{
				Entrypoint: "a.jsonnet",
				Files: map[string]string{
					"a.jsonnet": `local n = import 'something'
n.run()`,
				},
			},
			wantErr: errs.ErrReceiver,
		},
		"bad config": {
			imports: &Imports{
				Entrypoint: "b.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"b.jsonnet": `local n = import 'native.libsonnet';

n.getConfig().Vars`,
				},
			},
			wantErr: errs.ErrReceiver,
		},
		"good config": {
			config: &c,
			imports: &Imports{
				Entrypoint: "c.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"c.jsonnet": `local n = import 'native.libsonnet';

{
	String: n.getConfig().Vars.hello,
}`,
				},
			},
			wantOut: testdata{
				String: "world",
			},
		},
		"bad getEnv": {
			config: c,
			imports: &Imports{
				Entrypoint: "d.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"d.jsonnet": `local n = import 'native.libsonnet';
{
	String: n.getEnv()
}
`,
				},
			},
			wantErr: errs.ErrReceiver,
		},
		"good getEnv": {
			config: c,
			imports: &Imports{
				Entrypoint: "e.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"e.jsonnet": `local n = import 'native.libsonnet';
{
	String: n.getEnv('hello')
}
`,
				},
			},
			wantOut: testdata{
				String: "world",
			},
		},
		"bad getPath": {
			config: c,
			imports: &Imports{
				Entrypoint: "d.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"d.jsonnet": `local n = import 'native.libsonnet';
{
	String: n.getPath('testdata/imports/text.ttttxt')
}
`,
				},
			},
			wantErr: errs.ErrReceiver,
		},
		"bad getPathHTTP": {
			config: c,
			imports: &Imports{
				Entrypoint: "d.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"d.jsonnet": `local n = import 'native.libsonnet';
{
	String: n.getPath('http://127.0.0.1:62000/test')
}
`,
				},
			},
			wantErr: errs.ErrReceiver,
		},
		"good getPath": {
			config: c,
			imports: &Imports{
				Entrypoint: "e.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"e.jsonnet": `local n = import 'native.libsonnet';
{
	String: n.getPath('testdata/imports/text.txt')
}
`,
				},
			},
			wantOut: testdata{
				String: "Hello",
			},
		},
		"bad record": {
			config: c,
			imports: &Imports{
				Entrypoint: "f.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"f.jsonnet": `local n = import 'native.libsonnet';
{
	String: n.getRecord()
}
`,
				},
			},
			wantErr: errs.ErrReceiver,
		},
		"good record": {
			config: c,
			imports: &Imports{
				Entrypoint: "f.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"f.jsonnet": `local n = import 'native.libsonnet';
{
	String: n.getRecord('a', 'app01.xlc1.candid.dev') + ' ' + n.getRecord('cname', 'candid.dev')
}
`,
				},
			},
			wantOut: testdata{
				String: "10.0.1.11 candid.dev.",
			},
		},
		"good imports": {
			config:  c,
			imports: i,
			wantOut: testdata{
				Int:    1,
				String: "Hello",
			},
			wantRequests: []get.HTTPMockRequest{
				{
					Headers: http.Header{
						"A": []string{
							"b",
							"c",
						},
						"C": []string{
							"d",
						},
					},
					Path:   "/test",
					Status: 200,
				},
			},
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			data := testdata{}

			r := NewRender(ctx, tc.config)
			r.Import(tc.imports)
			assert.HasErr(t, r.Render(ctx, &data), tc.wantErr)
			assert.Equal(t, data, tc.wantOut)
			assert.Equal(t, ts.Requests(), tc.wantRequests)
		})
	}
}
