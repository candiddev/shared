package types

import (
	"encoding/json"
	"testing"

	"github.com/candiddev/shared/go/assert"
)

type password struct {
	Password Password `json:"password"`
}

func TestPasswordHash(t *testing.T) {
	p := Password("testing")

	// Same salt should generate the same password
	want, err := p.Hash([]byte("UkJ45J0CFoyuF0q4"))
	assert.Equal(t, err, nil)
	got, err := p.Hash([]byte("UkJ45J0CFoyuF0q4"))
	assert.Equal(t, err, nil)
	assert.Equal(t, got, want)

	got, err = p.Hash(nil)
	assert.Equal(t, err, nil)
	assert.Equal(t, got != want, true)

	// Random salt hash
	hash1, _ := p.Hash(nil)
	assert.Equal(t, p.CompareHashAndPassword(hash1), nil)

	// New salt hash
	hash2, _ := p.Hash([]byte("Hello!"))
	assert.Equal(t, p.CompareHashAndPassword(hash2), nil)

	p2 := Password("testing1")
	hash3, _ := p2.Hash(nil)
	assert.Equal[error](t, p.CompareHashAndPassword(hash3), ErrClientBadRequestPassword)

	// Test independent output
	assert.Equal(t, p2.CompareHashAndPassword("$argon2id$v=19$m=16384,t=2,p=1$VWtKNDVKMENGb3l1RjBxNA$NZ5egRH+wHRcwPPfF36J/LmMk1D58u8s0LteniA/IAY"), nil)
	assert.Equal[error](t, p2.CompareHashAndPassword("$argon2id$v=19$m=16384,t=2,p=1$VWtKNDVKMENGb3l1RjBxNA$NZ5egRH+MHRcwPPfF36J/LmMk1D58u8s0LteniA/IAY"), ErrClientBadRequestPassword)

	// Test unknown/invalid
	assert.Equal[error](t, p.CompareHashAndPassword("not a password"), ErrClientBadRequestPassword)
	assert.Equal[error](t, p.CompareHashAndPassword("$2a"), ErrClientBadRequestPassword)
	assert.Equal[error](t, p.CompareHashAndPassword("$argon2id$v=19$3$4$5"), ErrClientBadRequestInvalidPasswordHash)
}

func TestPasswordMarshalJSON(t *testing.T) {
	got, err := json.Marshal(password{
		Password: "ANewPassword!",
	})
	assert.Equal(t, err, nil)
	assert.Equal(t, string(got), `{"password":"ANewPassword!"}`)
}

func TestPasswordUnmarshalJSON(t *testing.T) {
	tests := map[string]struct {
		err   error
		input string
		want  password
	}{
		"invalid": {
			err:   ErrClientBadRequestPasswordLength,
			input: `{"password":1111}`,
			want:  password{},
		},
		"bad": {
			err:   ErrClientBadRequestPasswordLength,
			input: `{"password":"short"}`,
			want:  password{},
		},
		"good": {
			input: `{"password":"AGoodPassword"}`,
			want: password{
				Password: "AGoodPassword",
			},
		},
		"empty": {
			input: `{"password":""}`,
			want:  password{},
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			var p password

			err := json.Unmarshal([]byte(tc.input), &p)
			assert.Equal(t, err, tc.err)
			assert.Equal(t, p, tc.want)
		})
	}
}
