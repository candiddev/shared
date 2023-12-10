package jsonnet

import (
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/errs"
	"github.com/candiddev/shared/go/get"
	"github.com/candiddev/shared/go/logger"
)

func TestImportRender(t *testing.T) {
	ctx := logger.UseTestLogger(t)

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
		wantStdout   string
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
		"good getEnvFallback": {
			config: c,
			imports: &Imports{
				Entrypoint: "e.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"e.jsonnet": `local n = import 'native.libsonnet';
{
	String: n.getEnv('notRight', 'world')
}
`,
				},
			},
			wantOut: testdata{
				String: "world",
			},
		},
		"bad getFile": {
			config: c,
			imports: &Imports{
				Entrypoint: "d.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"d.jsonnet": `local n = import 'native.libsonnet';
{
	String: n.getFile('testdata/imports/text.ttttxt')
}
`,
				},
			},
			wantErr: errs.ErrReceiver,
		},
		"bad getFileHTTP": {
			config: c,
			imports: &Imports{
				Entrypoint: "d.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"d.jsonnet": `local n = import 'native.libsonnet';
{
	String: n.getFile('http://127.0.0.1:62000/test')
}
`,
				},
			},
			wantErr: errs.ErrReceiver,
		},
		"good getFile": {
			config: c,
			imports: &Imports{
				Entrypoint: "e.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"e.jsonnet": `local n = import 'native.libsonnet';
{
	String: n.getFile('testdata/imports/text.txt')
}
`,
				},
			},
			wantOut: testdata{
				String: "Hello",
			},
		},
		"good getFile fallback": {
			config: c,
			imports: &Imports{
				Entrypoint: "f.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"f.jsonnet": `local n = import 'native.libsonnet';
{
	String: n.getFile('/not/a/real/path', 'hello')
}
`,
				},
			},
			wantOut: testdata{
				String: "hello",
			},
		},
		"getPath": {
			config: c,
			imports: &Imports{
				Entrypoint: "f.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"f.jsonnet": `local n = import 'native.libsonnet';
{
	String: n.getPath(),
}
`,
				},
			},
			wantOut: testdata{
				String: "/etc/main.jsonnet",
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
	String: n.getRecord('a', 'one.one.one.one.')[0] + n.getRecord('aaaa', 'one.one.one.one.')[0] + ' ' + n.getRecord('cname', 'candid.dev')[0]
}
`,
				},
			},
			wantOut: testdata{
				String: "1.0.0.12606:4700:4700::1001 candid.dev.",
			},
		},
		"good record fallback": {
			config: c,
			imports: &Imports{
				Entrypoint: "f.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"f.jsonnet": `local n = import 'native.libsonnet';
{
	String: n.getRecord('a', 'not.a.real.domain.test', 'hello')
}
`,
				},
			},
			wantOut: testdata{
				String: "hello",
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
		"bad render": {
			config: c,
			imports: &Imports{
				Entrypoint: "f.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"f.jsonnet": `local n = import 'native.libsonnet';

local rendered = n.render(|||
{
	String: std.native('getFile')('testdata/imports/text.txt')

|||);

rendered
`,
				},
			},
			wantErr: errs.ErrReceiver,
		},
		"good render": {
			config: c,
			imports: &Imports{
				Entrypoint: "f.jsonnet",
				Files: map[string]string{
					"native.libsonnet": Native,
					"f.jsonnet": `local n = import 'native.libsonnet';

local rendered = n.render(|||
	{String: std.native('getFile')('testdata/imports/text.txt', '')}
|||);

rendered
`,
				},
			},
			wantOut: testdata{
				String: "Hello",
			},
		},
		"good trace": {
			config: c,
			imports: &Imports{
				Entrypoint: "/main.jsonnet",
				Files: map[string]string{
					"/main.jsonnet": `{
	String: std.trace('hello', 'world')
}`,
				},
			},
			wantOut: testdata{
				String: "world",
			},
			wantStdout: "hello",
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			data := testdata{}

			logger.SetStd()
			r := NewRender(ctx, tc.config)
			r.path = "/etc/main.jsonnet"
			r.Import(tc.imports)
			assert.HasErr(t, r.Render(ctx, &data), tc.wantErr)
			assert.Equal(t, data, tc.wantOut)
			assert.Equal(t, ts.Requests(), tc.wantRequests)
			assert.Equal(t, strings.Contains(logger.ReadStd(), tc.wantStdout), true)
		})
	}

	// Test randStr
	logger.UseTestLogger(t)

	r := NewRender(ctx, c)
	i = &Imports{
		Entrypoint: "main.jsonnet",
		Files: map[string]string{
			"native.libsonnet": Native,
			"main.jsonnet": `local n = import 'native.libsonnet';
		{
			String: n.randStr(10),
		}`,
		},
	}

	r.Import(i)

	data := testdata{}
	assert.HasErr(t, r.Render(ctx, &data), nil)
	assert.Equal(t, len(data.String), 10)

	i.Files["main.jsonnet"] = strings.Replace(i.Files["main.jsonnet"], "10", "'10'", 1)
	r = NewRender(ctx, c)

	r.Import(i)
	assert.HasErr(t, r.Render(ctx, &data), errs.ErrReceiver)
}
