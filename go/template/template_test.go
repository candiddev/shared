package template

import (
	"context"
	"testing"
	"time"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/get"
	"sigs.k8s.io/yaml"
)

type tmpl struct {
	APIValue   string
	DNSA       string
	DNSCNAME   string
	DNSTxt     string
	EmptyValue string
	JSONList   []map[string]any
	New        bool
	Old        bool
	VaultValue string
	YAMLList   []map[string]any
}

func TestExec(t *testing.T) {
	ctx := context.Background()
	m1 := get.NewHTTPMock([]string{"/test"}, []byte(`{
		"hello": "goodbye"
	}`), time.Time{})

	m2 := get.NewHTTPMock([]string{"/test"}, []byte(`[
		"hello",
		"world"
	]`), time.Time{})

	t.Setenv("API_ADDR", m2.URL())
	t.Setenv("VAULT_ADDR", m1.URL())
	t.Setenv("VAULT_TOKEN", "12345")

	input := `
{{- $apiAddr := env "API_ADDR" }}
{{- $vaultAddr := env "VAULT_ADDR" }}
{{- $vaultToken := env "VAULT_TOKEN" }}
{{- $api := get (printf "%s/test" $apiAddr) | decode_json | encode_yaml | decode_yaml }}
{{- $vault := get (printf "%s/test#vault-token:11%s" $vaultAddr $vaultToken) | decode_json -}}
APIValue: {{ index $api 1 }}
DNSA: {{ dns "a" "app01.xlc1.candid.dev" }}
DNSCNAME: {{ dns "cname" "vault.candid.dev" }}
DNSTxt: {{ dns "txt" "candid.dev" }}
EmptyValue: {{ try $vault.notreal }}
JSONList: {{ list $vault | encode_json }}
New: {{ try $vault.notreal .Old }}
VaultValue: {{ $vault.hello }}
YAMLList:
{{- range (list 1 2) }}
{{ printf "- %s%d" ($vault | encode_yaml) . | indent 2 }}
{{- end -}}
`

	output := tmpl{
		Old: true,
	}

	tn, err := Render(ctx, input, &output)

	assert.Equal(t, tn, `APIValue: world
DNSA: 10.0.1.11
DNSCNAME: lbl01.has1.candid.dev.
DNSTxt: google-site-verification=2Ron2YuzBwpi82WEqfCEhuSjgLhJ2gD01VcNv9NH2pcv=spf1 include:_spf.google.com -all
EmptyValue: 
JSONList: [{"hello":"goodbye"}]
New: true
VaultValue: goodbye
YAMLList:
  - hello: goodbye1
  - hello: goodbye2`)
	assert.HasErr(t, err, nil)
	assert.Equal(t, len(m1.Requests()), 1)
	assert.Equal(t, len(m2.Requests()), 1)
	assert.HasErr(t, yaml.Unmarshal([]byte(tn), &output), nil)
	assert.Equal(t, output, tmpl{
		APIValue: "world",
		DNSA:     "10.0.1.11",
		DNSCNAME: "lbl01.has1.candid.dev.",
		DNSTxt:   "google-site-verification=2Ron2YuzBwpi82WEqfCEhuSjgLhJ2gD01VcNv9NH2pcv=spf1 include:_spf.google.com -all",
		JSONList: []map[string]any{
			{
				"hello": "goodbye",
			},
		},
		New:        true,
		Old:        true,
		VaultValue: "goodbye",
		YAMLList: []map[string]any{
			{
				"hello": "goodbye1",
			},
			{
				"hello": "goodbye2",
			},
		},
	})
}
