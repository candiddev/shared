package cli

import (
	"maps"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/errs"
)

var testFlags = Flags{
	"a": &Flag{
		Default: []string{
			"no",
			"yesasssssss",
		},
		Placeholder: "value",
		Usage:       "Here is a long usage for the flag",
	},
	"b": &Flag{
		Usage: "B",
	},
	"c": &Flag{
		Placeholder: "hello world",
		Usage:       "C",
	},
}

func TestFlagsParse(t *testing.T) {
	f := []string{
		"-a",
		"aa",
		"-c",
		"bb",
		"-b",
		"command",
		"-f",
	}

	r, err := testFlags.Parse(f)
	assert.HasErr(t, err, nil)
	assert.Equal(t, r, []string{"command", "-f"})

	assert.Equal(t, testFlags["a"].values, []string{"aa"})
	assert.Equal(t, testFlags["b"].values, []string{""})
	assert.Equal(t, testFlags["c"].values, []string{"bb"})
	assert.Equal(t, testFlags["d"], nil)

	testFlags["a"].values = nil
	testFlags["b"].values = nil
	testFlags["c"].values = nil

	_, err = testFlags.Parse([]string{"-z"})
	assert.HasErr(t, err, errs.ErrReceiver)

	r, err = Flags{}.Parse([]string{"-"})
	assert.HasErr(t, err, nil)
	assert.Equal(t, r, []string{"-"})
}

func TestFlagsUsage(t *testing.T) {
	assert.Equal(t, "\n"+testFlags.Usage(10, "  "), `
  -a [value]
     Here is a
     long usage
     for the
     flag
     (default:
     no,
     yesasssssss)
  -b
     B
  -c [hello world]
     C
`)
}

func TestFlagsValue(t *testing.T) {
	f := maps.Clone(testFlags)
	f["a"].values = []string{"a", "b", "c"}

	v, d := f.Value("a")

	assert.Equal(t, d, true)
	assert.Equal(t, v, "c")

	vs, d := f.Values("a")

	assert.Equal(t, d, true)
	assert.Equal(t, vs, []string{"a", "b", "c"})

	v, d = f.Value("b")

	assert.Equal(t, d, false)
	assert.Equal(t, v, "")

	vs, d = f.Values("a")

	assert.Equal(t, d, true)
	assert.Equal(t, vs, []string{"a", "b", "c"})
}
