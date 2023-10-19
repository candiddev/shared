package jwt

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestAudienceMarshalUnmarshal(t *testing.T) {
	tests := map[string]struct {
		input           Audience
		wantMarshalJSON []byte
	}{
		"single": {
			input: Audience{
				"hello",
			},
			wantMarshalJSON: []byte(`"hello"`),
		},
		"double": {
			input: Audience{
				"hello",
				"world",
			},
			wantMarshalJSON: []byte(`["hello","world"]`),
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			out, err := tc.input.MarshalJSON()
			assert.HasErr(t, err, nil)
			assert.Equal(t, out, tc.wantMarshalJSON)

			a := Audience{}

			err = a.UnmarshalJSON(out)
			assert.HasErr(t, err, nil)
			assert.Equal(t, a, tc.input)
		})
	}
}
