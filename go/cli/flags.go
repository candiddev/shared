package cli

import (
	"fmt"
	"sort"
	"strings"

	"github.com/candiddev/shared/go/errs"
)

// Flags is a map of flags and their usage.
type Flags map[string]*Flag

// Parse reads args, parses flags, and returns the remaining ones.
func (f Flags) Parse(args []string) (remaining []string, err errs.Err) {
	i := 0

	for i < len(args) {
		if !strings.HasPrefix(args[i], "-") {
			break
		}

		a := strings.TrimPrefix(args[i], "-")
		if _, ok := f[a]; !ok {
			return nil, errs.ErrReceiver.Wrap(fmt.Errorf("flag provided but not defined: %s", args[i]))
		}

		s := ""
		if f[a].Placeholder != "" && !strings.HasPrefix(args[i+1], "-") {
			s = args[i+1]
			i++
		}

		f[a].Values = append(f[a].Values, s)

		i++
	}

	return args[i:], nil
}

// Usage prints the usage docs for flags.
func (f Flags) Usage(width int, indent string) string {
	o := ""
	keys := make([]string, len(f))
	i := 0

	for k := range f {
		keys[i] = k
		i++
	}

	sort.Strings(keys)

	for _, k := range keys {
		l := fmt.Sprintf("%s-%s", indent, k)

		if f[k].Placeholder != "" {
			l += fmt.Sprintf(" [%s]", f[k].Placeholder)
		}

		u := f[k].Usage

		if len(f[k].Options) > 0 {
			u += fmt.Sprintf(": %s", strings.Join(f[k].Options, ", "))
		}

		if f[k].Default != "" {
			u += fmt.Sprintf(" (default: %s)", f[k].Default)
		}

		o += fmt.Sprintf("%s\n%s   %s\n", l, indent, wrapLines(width, u, indent+"   "))
	}

	return o
}

// Flag is a Flag's usage.
type Flag struct {
	Default     string
	Options     []string
	Placeholder string
	Usage       string
	Values      []string
}

// Value returns the last value of Flag.Values and whether it was defined.
func (f Flags) Value(flag string) (value string, defined bool) {
	if v, ok := f[flag]; ok {
		if len(v.Values) > 0 {
			return v.Values[len(v.Values)-1], true
		}

		return v.Default, false
	}

	return "", false
}
