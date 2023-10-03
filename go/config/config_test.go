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
)

type customStrings []string

func (*customStrings) ParseString(input string) any {
	return strings.Split(input, ",")
}

type config struct {
	App      configApp       `json:"app"`
	Commands []configCommand `json:"commands"`
	Vars     map[string]any  `json:"vars"`
}

type configApp struct {
	Arg1               string        `json:"arg1"`
	Arg2               string        `json:"arg2"`
	Arg3               string        `json:"arg3"`
	Env                string        `json:"env"`
	PostgreSQLUsername string        `json:"postgreSQLUsername"`
	Debug              bool          `json:"debug"`
	Lists              []string      `json:"lists"`
	ListEl             string        `json:"listEl"`
	Port               int           `json:"port"`
	Strings            customStrings `json:"strings"`
	Vault              any           `json:"vault"`
	Yes                bool          `json:"bool"`
}

type configCommand struct {
	Exec string `json:"exec"`
	Path string `json:"path"`
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
	t.Setenv("HOMECHART_APP_ARG2", "b")
	t.Setenv("HOMECHART_APP_ARG3", "c")
	t.Setenv("HOMECHART_APP_PORT", "22")
	t.Setenv("HOMECHART_CONFIG", `{
  vars: {
    arg: 1
  }
}`)
	t.Setenv("ENV", "prd")
	t.Setenv("HOMECHART_APP_YES", "yes")

	c := config{}

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
			ListEl:             "world",
			PostgreSQLUsername: "tester",
			Port:               22,
			Vault: map[string]any{
				"app_port":            "12345",
				"postgresql_username": "tester",
			},
			Yes: true,
		},
		Commands: []configCommand{
			{
				Exec: "hello",
				Path: "this",
			},
			{
				Exec: "hello",
				Path: "that",
			},
		},
		Vars: map[string]any{
			"arg":  float64(2),
			"test": false,
		},
	}

	assert.Equal(t, Parse(ctx, &c, "HOMECHART", "", `app_arg1=d,config={"vars":{"test": false}},vars_arg=2`, "testdata/good.json,testdata/good.jsonnet"), nil)
	assert.Equal(t, c, want)
}
