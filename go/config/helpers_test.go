package config

import (
	"context"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestParseValue(t *testing.T) {
	c := config{}
	ctx := context.Background()

	assert.Equal(t, ParseValues(ctx, &c, "CONFIG", []string{
		`CONFIG_app_arg1=hello`,
	}) != nil, false)
	assert.Equal(t, ParseValues(ctx, &c, "CONFIG", []string{
		`CONFIG_app_arg2=hello`,
	}) != nil, false)
	assert.Equal(t, c.App.Arg1, "hello")
	assert.Equal(t, c.App.Arg2, "hello")

	assert.Equal(t, ParseValues(ctx, &c, "CONFIG", []string{
		`CONFIG_app_nested_bool_bool="true"`,
	}) != nil, true)

	assert.Equal(t, ParseValues(ctx, &c, "CONFIG", []string{
		`CONFIG_app_nested_bool_bool=true`,
	}) != nil, false)
	assert.Equal(t, c.App.Nested["bool"].Bool, true)
	assert.Equal(t, ParseValues(ctx, &c, "CONFIG", []string{
		`CONFIG_app_nested_bool_bool=false`,
	}) != nil, false)
	assert.Equal(t, c.App.Nested["bool"].Bool, false)

	assert.Equal(t, ParseValues(ctx, &c, "CONFIG", []string{
		`CONFIG_app_nested_other_string=yes`,
	}) != nil, false)
	assert.Equal(t, ParseValues(ctx, &c, "CONFIG", []string{
		`CONFIG_app_nested_other_int=10`,
	}) != nil, false)
	assert.Equal(t, c.App.Nested, map[string]*configAppNested{
		"bool": {
			Bool: false,
		},
		"other": {
			Int:    10,
			String: "yes",
		},
	})
}
