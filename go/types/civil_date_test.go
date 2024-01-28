package types

import (
	"encoding/json"
	"fmt"
	"testing"
	"time"

	"github.com/candiddev/shared/go/assert"
)

var cd = CivilDate{
	Day:   2,
	Month: 1,
	Year:  2006,
}

type cdS struct {
	CivilDate CivilDate `json:"civilDate"`
}

func TestCivilDateToday(t *testing.T) {
	todayDate := CivilDateToday()
	todayTime := time.Now().Local()

	assert.Equal(t, todayDate.Year, todayTime.Year())
	assert.Equal(t, todayDate.Month, todayTime.Month())
	assert.Equal(t, todayDate.Day, todayTime.Day())
}

func TestCivilDateOf(t *testing.T) {
	ds := fmt.Sprintf("%04d-%02d-%02d", cd.Year, cd.Month, cd.Day)
	tm, _ := time.Parse("2006-01-02", ds)

	assert.Equal(t, CivilDateOf(tm), cd)
}

func TestMapToCivilDate(t *testing.T) {
	assert.Equal(t, MapToCivilDate(map[string]any{
		"year":  float64(2021),
		"month": float64(8),
		"day":   float64(24),
	}), CivilDate{
		Year:  2021,
		Month: 8,
		Day:   24,
	})
}

func TestParseCivilDate(t *testing.T) {
	tests := map[string]struct {
		err   bool
		input string
		want  CivilDate
	}{
		"good date": {
			input: "2006-01-02",
			want: CivilDate{
				Day:   2,
				Month: 1,
				Year:  2006,
			},
		},
		"bad date": {
			err:   true,
			input: "2006-01",
			want:  CivilDate{},
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			c, err := ParseCivilDate(tc.input)

			assert.Equal(t, c, tc.want)
			assert.Equal(t, err != nil, tc.err)
		})
	}
}

func TestCivilDateString(t *testing.T) {
	assert.Equal(t, cd.String(), "2006-01-02")
}

func TestCivilDateStringFormat(t *testing.T) {
	tests := map[string]struct {
		got  string
		want string
	}{
		"M/D/Y": {
			got:  cd.StringFormat(CivilDateOrderMDY, CivilDateSeparatorForwardSlash),
			want: "01/02/2006",
		},
		"Y-M-D": {
			got:  cd.StringFormat(CivilDateOrderYMD, CivilDateSeparatorDash),
			want: "2006-01-02",
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			assert.Equal(t, tc.got, tc.want)
		})
	}
}

func TestCivilDateYearMonth(t *testing.T) {
	assert.Equal(t, cd.YearMonth(), YearMonth(200601))
}

func TestCivilDateAddDays(t *testing.T) {
	tests := map[string]struct {
		input int
		want  CivilDate
	}{
		"add days": {
			input: 7,
			want: CivilDate{
				Day:   9,
				Month: 1,
				Year:  2006,
			},
		},
		"subtract days": {
			input: -7,
			want: CivilDate{
				Day:   26,
				Month: 12,
				Year:  2005,
			},
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			assert.Equal(t, cd.AddDays(tc.input), tc.want)
		})
	}
}

func TestCivilDateAddMonths(t *testing.T) {
	tests := map[string]struct {
		input  CivilDate
		months int
		want   CivilDate
	}{
		"add months": {
			input: CivilDate{
				Day:   2,
				Month: 1,
				Year:  2006,
			},
			months: 48,
			want: CivilDate{
				Day:   2,
				Month: 1,
				Year:  2010,
			},
		},
		"add months 1": {
			input: CivilDate{
				Day:   1,
				Month: 1,
				Year:  2006,
			},
			months: 5,
			want: CivilDate{
				Day:   1,
				Month: 6,
				Year:  2006,
			},
		},
		"subtract months 1": {
			input: CivilDate{
				Day:   2,
				Month: 1,
				Year:  2006,
			},
			months: -3,
			want: CivilDate{
				Day:   2,
				Month: 10,
				Year:  2005,
			},
		},
		"subtract months 2": {
			input: CivilDate{
				Day:   31,
				Month: 3,
				Year:  2006,
			},
			months: -12,
			want: CivilDate{
				Day:   31,
				Month: 3,
				Year:  2005,
			},
		},
		"february this year": {
			input: CivilDate{
				Day:   31,
				Month: 3,
				Year:  2006,
			},
			months: -1,
			want: CivilDate{
				Day:   28,
				Month: 2,
				Year:  2006,
			},
		},
		"february last year": {
			input: CivilDate{
				Day:   31,
				Month: 3,
				Year:  2006,
			},
			months: -13,
			want: CivilDate{
				Day:   28,
				Month: 2,
				Year:  2005,
			},
		},
		"april": {
			input: CivilDate{
				Day:   31,
				Month: 3,
				Year:  2006,
			},
			months: 1,
			want: CivilDate{
				Day:   30,
				Month: 4,
				Year:  2006,
			},
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			assert.Equal(t, tc.input.AddMonths(tc.months), tc.want)
		})
	}
}

func TestCivilDateAfter(t *testing.T) {
	d1, _ := ParseCivilDate("2006-06-02")
	d2, _ := ParseCivilDate("2006-06-01")
	d3, _ := ParseCivilDate("2006-05-02")
	d4, _ := ParseCivilDate("2005-06-02")

	tests := map[string]struct {
		got  bool
		want bool
	}{
		"day after": {
			got:  d1.After(d2),
			want: true,
		},
		"month after": {
			got:  d1.After(d3),
			want: true,
		},
		"year after": {
			got:  d1.After(d4),
			want: true,
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			assert.Equal(t, tc.got, tc.want)
		})
	}
}

func TestCivilDateIsZero(t *testing.T) {
	assert.Equal(t, CivilDate{}.IsZero(), true)
	assert.Equal(t, CivilDate{
		Day:   0,
		Month: 0,
		Year:  0,
	}.IsZero(), true)
	assert.Equal(t, CivilDateToday().IsZero(), false)
}

func TestCivilDateMarshalJSON(t *testing.T) {
	m, err := json.Marshal(
		cdS{
			CivilDate: CivilDate{
				Year:  2019,
				Month: 1,
				Day:   1,
			},
		},
	)

	assert.Equal(t, err, nil)
	assert.Equal(t, string(m), `{"civilDate":"2019-01-01"}`)

	m, err = json.Marshal(cdS{
		CivilDate: CivilDate{},
	})
	assert.Equal(t, err, nil)
	assert.Equal(t, string(m), `{"civilDate":null}`)
}

func TestCivilDateUnmarshalJSON(t *testing.T) {
	tests := map[string]struct {
		err   bool
		input string
		want  cdS
	}{
		"invalid date": {
			err:   true,
			input: `{"civilDate":"2019-00-00"}`,
			want:  cdS{},
		},
		"null date": {
			input: `{"civilDate":null}`,
			want:  cdS{},
		},
		"good date": {
			input: `{"civilDate":"2019-01-01"}`,
			want: cdS{
				CivilDate: CivilDate{
					Day:   1,
					Month: 1,
					Year:  2019,
				},
			},
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			var c cdS

			err := json.Unmarshal([]byte(tc.input), &c)
			assert.Equal(t, err != nil, tc.err)
			assert.Equal(t, c, tc.want)
		})
	}
}

func TestCivilDateValue(t *testing.T) {
	got, err := cd.Value()
	assert.Equal(t, err, nil)
	assert.Equal(t, got, "2006-01-02")

	got, err = CivilDate{}.Value()
	assert.Equal(t, err, nil)
	assert.Equal(t, got, nil)
}

func TestCivilDateScan(t *testing.T) {
	now := time.Now()

	var d CivilDate

	err := d.Scan(now)
	assert.Equal(t, err, nil)
	assert.Equal(t, d, CivilDateOf(now))
}
