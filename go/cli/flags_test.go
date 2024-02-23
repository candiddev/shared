package cli

import (
	"maps"
	"testing"

	"github.com/candiddev/shared/go/assert"
	"github.com/candiddev/shared/go/errs"
)

var testFlags = Flags{
	"a": &Flag{
		Default:     "yesasssssss",
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

	assert.Equal(t, testFlags["a"].Values, []string{"aa"})
	assert.Equal(t, testFlags["b"].Values, []string{""})
	assert.Equal(t, testFlags["c"].Values, []string{"bb"})
	assert.Equal(t, testFlags["d"], nil)

	testFlags["a"].Values = nil
	testFlags["b"].Values = nil
	testFlags["c"].Values = nil

	_, err = testFlags.Parse([]string{"-z"})
	assert.HasErr(t, err, errs.ErrReceiver)
}

func TestFlagsUsage(t *testing.T) {
	assert.Equal(t, "\n"+testFlags.Usage(10, "  "), `
  -a [value]
     Here is a
     long usage
     for the
     flag
     (default:
     yesasssssss)
  -b
     B
  -c [hello world]
     C
`)
}

func TestFlagsValue(t *testing.T) {
	f := maps.Clone(testFlags)
	f["a"].Values = []string{"a", "b", "c"}

	v, d := f.Value("a")

	assert.Equal(t, d, true)
	assert.Equal(t, v, "c")

	v, d = f.Value("b")

	assert.Equal(t, d, false)
	assert.Equal(t, v, "")
}
