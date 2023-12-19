package types

import (
	"encoding/json"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

type color struct {
	Color Color `json:"color"`
}

func TestColorUnmarshal(t *testing.T) {
	tests := map[string]struct {
		err   bool
		input string
		want  color
	}{
		"bad": {
			err:   true,
			input: `{"color": "random"}`,
		},
		"default": {
			input: `{"color": ""}`,
			want: color{
				Color: ColorDefault,
			},
		},
		"greater": {
			err:   true,
			input: `{"color": "#1z1111"}`,
			want:  color{},
		},
		"good": {
			input: `{"color": "#00001c"}`,
			want: color{
				Color: "#00001c",
			},
		},
		"int": {
			input: `{"color": 1}`,
			want: color{
				Color: "red",
			},
		},
		"int-bad": {
			input: `{"color": 20}`,
			want: color{
				Color: "",
			},
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			var c color

			assert.Equal(t, json.Unmarshal([]byte(tc.input), &c) != nil, tc.err)
			assert.Equal(t, c, tc.want)
		})
	}
}
