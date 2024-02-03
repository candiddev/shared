package types

import (
	"bytes"
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"github.com/candiddev/shared/go/errs"
)

// SliceString is a slice of strings.
type SliceString []string

var ErrSenderBadRequestSliceString = errs.ErrSenderBadRequest.Set("Unable to parse string array")

// MarshalJSON converts a slice string to JSON array.
func (s SliceString) MarshalJSON() ([]byte, error) {
	j := "["

	for i, str := range s {
		if str == `""` { // fix bug with some existing slicestrings having empty quotes
			str = ""
		}

		j += fmt.Sprintf(`"%s"`, str)
		if i != len(s)-1 {
			j += ","
		}
	}

	j += "]"

	return []byte(j), nil
}

func (s *SliceString) UnmarshalJSON(data []byte) error {
	if bytes.HasPrefix(data, []byte(`"`)) {
		str, err := strconv.Unquote(string(data))
		if err != nil {
			return ErrSenderBadRequestSliceString.Wrap(err)
		}

		if str != "" {
			*s = SliceString{str}
		}
	} else {
		type tmpS SliceString

		var str tmpS

		if err := json.Unmarshal(data, &str); err != nil {
			return ErrSenderBadRequestSliceString.Wrap(err)
		}

		*s = SliceString(str)
	}

	return nil
}

// Value returns a JSON marshal of the slice string.
func (s SliceString) Value() (driver.Value, error) {
	if len(s) == 0 {
		return []byte("{}"), nil
	}

	var newS SliceString

	for _, item := range s {
		if item != "" {
			newS = append(newS, item)
		}
	}

	output := strings.Join(newS, ",")
	output = fmt.Sprintf("{%s}", output)

	return []byte(output), nil
}

// Scan reads in a byte slice and appends it to the slice.
func (s *SliceString) Scan(src any) error {
	if src != nil {
		source := string(src.([]byte))
		if source != "" && source != "{}" && source != "{NULL}" {
			output := strings.TrimRight(strings.TrimLeft(source, "{"), "}")
			array := strings.Split(output, ",")

			slice := SliceString{}

			for _, item := range array {
				if item != `""` && item[0] == '"' {
					slice = append(slice, item[1:len(item)-1])
				} else {
					slice = append(slice, item)
				}
			}

			*s = slice

			return nil
		}
	}

	*s = SliceString{}

	return nil
}
