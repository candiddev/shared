package types

import (
	"testing"

	"github.com/candiddev/shared/go/assert"
)

func TestAppendStructToMap(t *testing.T) {
	type s1 struct {
		A string
		B int
	}

	type s2 struct {
		B bool
		C int
	}

	s := s1{
		A: "a",
	}
	m := map[string]any{}

	assert.HasErr(t, AppendStructToMap(s, &m), nil)
	assert.Equal(t, m, map[string]any{
		"A": "a",
		"B": float64(0),
	})

	assert.HasErr(t, AppendStructToMap(s2{}, &m), nil)
	assert.Equal(t, m, map[string]any{
		"A": "a",
		"B": false,
		"C": float64(0),
	})
}
