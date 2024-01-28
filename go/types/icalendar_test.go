package types

import (
	"strings"
	"testing"
	"time"

	"github.com/candiddev/shared/go/assert"
)

var ics = strings.ReplaceAll(`BEGIN:VCALENDAR
VERSION:2.0
DESCRIPTION:Homechart
NAME:Homechart
PRODID:-//Candid Development//Homchart//EN
X-WR-CALDESC:Homechart
X-WR-CALNAME:Homechart
X-WR-TIMEZONE:Etc/GMT
BEGIN:VEVENT
DESCRIPTION:Go for a long walk\nGo out to dinner
DURATION:PT60M
DTSTAMP:20220101T120000Z
DTSTART:20220101T120000Z
EXDATE;VALUE=DATE:20210101,20220101
LAST-MODIFIED:20220101T120000Z
LOCATION:Downtown
RRULE:FREQ=YEARLY;BYMONTH=1;BYDAY=1TU;UNTIL=20221231T000000Z;INTERVAL=1
SUMMARY;LANGUAGE=en-us:Date Night
UID:1
BEGIN:VALARM
DESCRIPTION:Go for a long walk\nGo out to dinner
TRIGGER:-PT10M
ACTION:DISPLAY
END:VALARM
END:VEVENT
BEGIN:VEVENT
DTEND;VALUE=DATE:20221231
DTSTAMP:20220101T120000Z
DTSTART;VALUE=DATE:20221231
SUMMARY;LANGUAGE=en-us:A day
UID:2
END:VEVENT
BEGIN:VEVENT
DESCRIPTION:Another event
DTSTART;TZID=America/Chicago:20220101T120000Z
LOCATION:Somewhere
UID:3
END:VEVENT
END:VCALENDAR`, "\n", "\r\n")

func TestICalendarEvents(t *testing.T) {
	dt, _ := time.Parse(time.RFC3339, "2022-01-01T12:00:00Z")
	offset := 10

	date := CivilDate{
		Day:   31,
		Month: 12,
		Year:  2022,
	}

	e := ICalendarEvents{
		{
			Created: &dt,
			Details: `Go for a long walk
Go out to dinner`,
			Duration:     60,
			ID:           "1",
			Location:     "Downtown",
			Name:         "Date Night",
			NotifyOffset: &offset,
			Recurrence: &Recurrence{
				Month:      1,
				MonthWeek:  1,
				Separation: 1,
				Weekday:    Tuesday,
			},
			RecurrenceEnd: &date,
			SkipDays: SliceString{
				"2021-01-01",
				"2022-01-01",
			},
			TimestampStart: &dt,
			Updated:        &dt,
		},
		{
			Created:   &dt,
			DateEnd:   &date,
			DateStart: &date,
			ID:        "2",
			Name:      "A day",
		},
		{
			Details:        "Another event",
			ID:             "3",
			Location:       "Somewhere",
			TimeZone:       "America/Chicago",
			TimestampStart: &dt,
		},
	}

	got, err := e.String()
	assert.Equal(t, err, nil)
	assert.Equal(t, got, ics)
}

func TestICalendarEventsFromICS(t *testing.T) {
	dt, _ := time.Parse(time.RFC3339, "2022-01-01T12:00:00Z")
	l, _ := time.LoadLocation("America/Chicago")
	dt = dt.In(l)
	offset := 10

	date := CivilDate{
		Day:   31,
		Month: 12,
		Year:  2022,
	}

	want := ICalendarEvents{
		{
			Details: `Go for a long walk
Go out to dinner`,
			Duration:     60,
			ID:           "1",
			Location:     "Downtown",
			Name:         "Date Night",
			NotifyOffset: &offset,
			Recurrence: &Recurrence{
				Month:      1,
				MonthWeek:  1,
				Separation: 1,
				Weekday:    Tuesday,
			},
			RecurrenceEnd: &date,
			SkipDays: SliceString{
				"2021-01-01",
				"2022-01-01",
			},
			TimestampStart: &dt,
		},
		{
			DateEnd:   &date,
			DateStart: &date,
			ID:        "2",
			Name:      "A day",
		},
		{
			Details:        "Another event",
			ID:             "3",
			Location:       "Somewhere",
			TimeZone:       "America/Chicago",
			TimestampStart: &dt,
		},
	}

	got, err := ICalendarEventsFromICS(ics)
	assert.Equal(t, err, nil)
	assert.Equal(t, got, want)
}
