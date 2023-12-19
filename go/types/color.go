package types

import (
	"fmt"
	"regexp"
	"strconv"

	"github.com/candiddev/shared/go/errs"
)

// Color is an enum for a UI color.
type Color string

// Color is an enum for a UI color.
const (
	ColorDefault Color = ""
	ColorRed     Color = "red"
	ColorPink    Color = "pink"
	ColorOrange  Color = "orange"
	ColorYellow  Color = "yellow"
	ColorGreen   Color = "green"
	ColorTeal    Color = "teal"
	ColorBlue    Color = "blue"
	ColorIndigo  Color = "indigo"
	ColorPurple  Color = "purple"
	ColorBrown   Color = "brown"
	ColorBlack   Color = "black"
	ColorGray    Color = "gray"
	ColorWhite   Color = "white"
)

var regexpColorHex = regexp.MustCompile(`^#([A-Fa-f0-9]{6})$`)
var regexpColorName = regexp.MustCompile(`^(red|pink|orange|yellow|green|teal|blue|indigo|purple|brown|black|gray|white)$`)

// UnmarshalJSON is used for JSON unmarshalling.
func (c *Color) UnmarshalJSON(data []byte) error {
	v, err := strconv.Unquote(string(data))
	if err == nil {
		if regexpColorHex.MatchString(v) || regexpColorName.MatchString(v) || v == "" {
			*c = Color(v)

			return nil
		}
	}

	return errs.ErrSenderBadRequest.Set("Color must a valid name or a hex code").Wrap(fmt.Errorf("color has invalid value: %s", data))
}
