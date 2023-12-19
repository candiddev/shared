package types

import (
	"testing"
	"time"

	"github.com/candiddev/shared/go/assert"
)

var recurrence = Recurrence{
	Day:       1,
	Month:     1,
	MonthWeek: 1,
	Weekdays: []Weekday{
		1,
	},
}

const recurrenceWant = `{"day":1,"separation":0,"monthWeek":1,"month":1,"weekday":0,"weekdays":[1]}`

func TestParseRecurrenceFromICS(t *testing.T) {
	var noEnd *CivilDate

	end := &CivilDate{
		Day:   1,
		Month: 1,
		Year:  2022,
	}

	tests := map[string]struct {
		input          string
		wantCivilDate  *CivilDate
		wantRecurrence Recurrence
	}{
		"daily": {
			input:         "FREQ=DAILY;INTERVAL=2",
			wantCivilDate: noEnd,
			wantRecurrence: Recurrence{
				Separation: 2,
			},
		},
		"weekly": {
			input:         "FREQ=WEEKLY;WKST=SU;BYDAY=MO,TU;UNTIL=20220101T000000Z;INTERVAL=1",
			wantCivilDate: end,
			wantRecurrence: Recurrence{
				Separation: 1,
				Weekdays: []Weekday{
					Monday,
					Tuesday,
				},
			},
		},
		"monthly - day": {
			input:         "FREQ=MONTHLY;BYMONTHDAY=1;INTERVAL=1",
			wantCivilDate: noEnd,
			wantRecurrence: Recurrence{
				Day:        1,
				Separation: 1,
			},
		},
		"monthly - weekday": {
			input:         "FREQ=MONTHLY;BYDAY=1MO;INTERVAL=1",
			wantCivilDate: noEnd,
			wantRecurrence: Recurrence{
				MonthWeek:  1,
				Separation: 1,
				Weekday:    Monday,
			},
		},
		"yearly": {
			input:         "FREQ=YEARLY;BYMONTH=1;BYDAY=1MO;INTERVAL=1",
			wantCivilDate: noEnd,
			wantRecurrence: Recurrence{
				Month:      1,
				MonthWeek:  1,
				Separation: 1,
				Weekday:    Monday,
			},
		},
		"gmail": {
			input: "FREQ=MONTHLY;UNTIL=20101110;BYMONTHDAY=11",
			wantCivilDate: &CivilDate{
				Day:   10,
				Month: 11,
				Year:  2010,
			},
			wantRecurrence: Recurrence{
				Day:        11,
				Separation: 1,
			},
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			m := icsRrule.FindStringSubmatch("RRULE:" + tc.input)
			gotRecurrence, gotCivilDate, err := ParseRecurrenceFromICS(tc.input, m)
			assert.Equal(t, err, nil)
			assert.Equal(t, gotCivilDate, tc.wantCivilDate)
			assert.Equal(t, *gotRecurrence, tc.wantRecurrence)
		})
	}
}

func TestRecurrenceToICalendar(t *testing.T) {
	var noEnd *CivilDate

	end := &CivilDate{
		Day:   1,
		Month: 1,
		Year:  2022,
	}

	tests := map[string]struct {
		inputCivilDate  *CivilDate
		inputRecurrence Recurrence
		want            string
	}{
		"daily": {
			inputCivilDate: noEnd,
			inputRecurrence: Recurrence{
				Separation: 2,
			},
			want: "FREQ=DAILY;INTERVAL=2",
		},
		"weekly": {
			inputCivilDate: end,
			inputRecurrence: Recurrence{
				Separation: 1,
				Weekdays: []Weekday{
					Monday,
					Tuesday,
				},
			},
			want: "FREQ=WEEKLY;WKST=SU;BYDAY=MO,TU;UNTIL=20220101T000000Z;INTERVAL=1",
		},
		"monthly - day": {
			inputCivilDate: noEnd,
			inputRecurrence: Recurrence{
				Day:        1,
				Separation: 1,
			},
			want: "FREQ=MONTHLY;BYMONTHDAY=1;INTERVAL=1",
		},
		"monthly - weekday": {
			inputCivilDate: noEnd,
			inputRecurrence: Recurrence{
				MonthWeek:  1,
				Separation: 1,
				Weekday:    Monday,
			},
			want: "FREQ=MONTHLY;BYDAY=1MO;INTERVAL=1",
		},
		"yearly": {
			inputCivilDate: noEnd,
			inputRecurrence: Recurrence{
				Month:      1,
				MonthWeek:  1,
				Separation: 1,
				Weekday:    Monday,
			},
			want: "FREQ=YEARLY;BYMONTH=1;BYDAY=1MO;INTERVAL=1",
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			assert.Equal(t, tc.inputRecurrence.ToICalendar(tc.inputCivilDate), tc.want)
		})
	}
}

func TestRecurrenceScan(t *testing.T) {
	var r Recurrence

	assert.Equal(t, r.Scan([]byte(recurrenceWant)), nil)
	assert.Equal(t, r, recurrence)
}

func TestRecurrenceUnmarshalJSON(t *testing.T) {
	var r Recurrence

	assert.Equal[error](t, r.UnmarshalJSON([]byte(`{"separation": -1}`)), ErrRecurrenceSeparation)
	assert.Equal(t, r, Recurrence{
		Separation: -1,
	})
}

func TestRecurrenceValidate(t *testing.T) {
	tests := map[string]struct {
		err   error
		input Recurrence
	}{
		"invalid day": {
			err: ErrRecurrenceDay,
			input: Recurrence{
				Day: -50,
			},
		},
		"invalid separation": {
			err: ErrRecurrenceSeparation,
			input: Recurrence{
				Separation: -50,
			},
		},
		"invalid monthweek": {
			err: ErrRecurrenceMonthWeek,
			input: Recurrence{
				MonthWeek: -50,
			},
		},
		"invalid weekday value": {
			err: ErrRecurrenceWeekdayValue,
			input: Recurrence{
				Weekdays: []Weekday{
					-50,
				},
			},
		},
		"invalid weekday duplicate": {
			err: ErrRecurrenceWeekdayDuplicate,
			input: Recurrence{
				Weekdays: []Weekday{
					1,
					1,
				},
			},
		},
		"Every other day": {
			input: Recurrence{
				Separation: 2,
			},
		},
		"Every other month on the 2nd": {
			input: Recurrence{
				Day:        2,
				Separation: 2,
			},
		},
		"Every other monday": {
			input: Recurrence{
				Separation: 1,
				Weekdays: []Weekday{
					Monday,
				},
			},
		},
		"Every september 1st": {
			input: Recurrence{
				Day:        1,
				Month:      time.September,
				Separation: 1,
			},
		},
		"Every last saturday": {
			input: Recurrence{
				MonthWeek:  -1,
				Separation: 2,
				Weekday:    Saturday,
			},
		},
		"Every last saturday of september": {
			input: Recurrence{
				Month:      time.September,
				MonthWeek:  -1,
				Separation: 2,
				Weekday:    Saturday,
			},
		},
	}

	for name, tc := range tests {
		t.Run(name, func(t *testing.T) {
			assert.HasErr(t, tc.input.Validate(), tc.err)
		})
	}
}

func TestRecurrenceValue(t *testing.T) {
	got, err := recurrence.Value()
	assert.Equal(t, err, nil)
	assert.Equal(t, string(got.([]byte)), recurrenceWant)
}
