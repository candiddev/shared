package config

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/types"
)

type config struct {
	App      configApp       `json:"app"`
	Commands []configCommand `json:"commands"`
	Vars     map[string]any  `json:"vars"`
}

type configApp struct {
	Arg1               string                      `json:"arg1"`
	Arg2               string                      `json:"arg2"`
	Arg3               string                      `json:"arg3"`
	Env                string                      `json:"env"`
	PostgreSQLUsername string                      `json:"postgreSQLUsername"`
	Debug              bool                        `json:"debug"`
	Lists              []string                    `json:"lists"`
	ListEl             string                      `json:"listEl"`
	Nested             map[string]*configAppNested `json:"nested"`
	Port               int                         `json:"port"`
	Strings            types.SliceString           `json:"strings"`
	Vault              any                         `json:"vault"`
	Yes                bool                        `json:"yes"`
}

type configCommand struct {
	Exec string `json:"exec"`
	Path string `json:"path"`
}

type configAppNested struct {
	Bool   bool   `json:"bool"`
	Int    int    `json:"int"`
	String string `json:"string"`
}

var vaultSrv = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	data := map[string]any{
		"data": map[string]string{
			"app_port":            "12345",
			"postgresql_username": "tester",
		},
	}

	j, _ := json.Marshal(&data)
	w.Header().Set("Content-Type", "application/json")
	w.Write(j)
}))

func TestParse(t *testing.T) {
	ctx := context.Background()

	os.Setenv("VAULT_ADDR", vaultSrv.URL) //nolint:tenv
	t.Setenv("VAULT_TOKEN", "")
	t.Setenv("HOMECHART_APP_ARG1", "a")
	t.Setenv("HOMECHART_app_arg2", "b")
	t.Setenv("HOMECHART_app_arg3", "c")
	t.Setenv("HOMECHART_app_port", "22")
	t.Setenv("HOMECHART_app_nested_something_bool", "true")
	t.Setenv("HOMECHART_config", `{
  vars: {
    arg: 1
  }
}`)
	t.Setenv("ENV", "prd")
	t.Setenv("HOMECHART_app_yes", "true")

	c := config{
		App: configApp{
			Lists: []string{
				"a",
				"b",
			},
		},
	}

	want := config{
		App: configApp{
			Arg1:  "d",
			Arg2:  "b",
			Arg3:  "c",
			Debug: true,
			Env:   "prd",
			Lists: []string{
				"this",
				"that",
			},
			ListEl: "b",
			Nested: map[string]*configAppNested{
				"something": {
					Bool: true,
				},
			},
			PostgreSQLUsername: "tester",
			Port:               22,
			Strings:            types.SliceString{},
			Vault: map[string]any{
				"app_port":            "12345",
				"postgresql_username": "tester",
			},
			Yes: true,
		},
		Commands: []configCommand{
			{
				Exec: "a",
				Path: "this",
			},
			{
				Exec: "a",
				Path: "that",
			},
		},
		Vars: map[string]any{
			"arg":  float64(2),
			"test": false,
		},
	}

	assert.Equal(t, Parse(ctx, &c, strings.Split(`app_arg1=d,config={"vars":{"test": false}},vars_arg=2`, ","), "HOMECHART", "testdata/good.jsonnet"), nil)
	assert.Equal(t, c, want)
}
