package types

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestSliceStringMarshalJSON(t *testing.T) {
	tests := map[string]struct {
		input SliceString
		want  string
	}{
		"multiple": {
			input: SliceString{"test", "test2", ""},
			want:  `["test","test2",""]`,
		},
		"single": {
			input: SliceString{""},
			want:  `[""]`,
		},
		"zero": {
			input: SliceString{},
			want:  "[]",
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			got, err := tc.input.MarshalJSON()
			assert.Equal(t, err, nil)
			assert.Equal(t, string(got), tc.want)
		})
	}
}

func TestSliceStringUnmarshalJSON(t *testing.T) {
	tests := map[string]struct {
		input   string
		want    SliceString
		wantErr bool
	}{
		"string": {
			input: `"test"`,
			want:  SliceString{"test"},
		},
		"none": {
			input: `""`,
			want:  SliceString{},
		},
		"array": {
			input: `["test1", "test2"]`,
			want:  SliceString{"test1", "test2"},
		},
		"unknown": {
			input:   "1",
			want:    SliceString{},
			wantErr: true,
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			s := SliceString{}
			assert.Equal(t, s.UnmarshalJSON([]byte(tc.input)) != nil, tc.wantErr)
			assert.Equal(t, s, tc.want)
		})
	}
}

func TestSliceStringValue(t *testing.T) {
	tests := map[string]struct {
		input SliceString
		want  string
	}{
		"multiple": {
			input: SliceString{"test", "test2"},
			want:  `{test,test2}`,
		},
		"multiple with empty": {
			input: SliceString{"test", "test2", ""},
			want:  `{test,test2}`,
		},
		"zero": {
			input: SliceString{},
			want:  `{}`,
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			got, err := tc.input.Value()
			assert.Equal(t, err, nil)
			assert.Equal(t, string(got.([]byte)), tc.want)
		})
	}
}

func TestSliceStringScan(t *testing.T) {
	s := SliceString{}

	tests := map[string]struct {
		input []byte
		want  SliceString
	}{
		"empty": {
			input: []byte("{}"),
			want:  s,
		},
		"null": {
			input: []byte("{NULL}"),
			want:  s,
		},
		"single": {
			input: []byte("{test}"),
			want: SliceString{
				"test",
			},
		},
		"2": {
			input: []byte(`{test1,test2,"","test 3"}`),
			want: SliceString{
				"test1",
				"test2",
				`""`,
				"test 3",
			},
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			s := SliceString{
				"existingValue1",
				"existingValue2",
			}

			assert.Equal(t, s.Scan(tc.input), nil)
			assert.Equal(t, s, tc.want)
		})
	}
}
