import {
  CivilDate,
  CivilDateOrderEnum,
  CivilDateSeparatorEnum,
} from "./CivilDate";
import { Month } from "./Month";
import { Timestamp } from "./Timestamp";
import { Weekday, WeekdayEnum } from "./Weekday";

describe("Timestamp", () => {
  const timestamp = Timestamp.fromString("2020-06-04T15:50:43.123456Z");

  test("fromCivilDate", () => {
    const date = new CivilDate(2020, 6, 19);
    const t = Timestamp.fromCivilDate(date);

    expect(t.toString()).toBe("2020-06-19T05:00:00.000Z");
  });

  test("fromString", () => {
    const now = Timestamp.now();
    const t = Timestamp.fromString("notatimestamp");

    expect(t.toCivilDate()).toEqual(now.toCivilDate());
  });

  test.each([
    [
      "2019-09-28",
      "2019-10-01",
      ["2019-09-28", "2019-09-29", "2019-09-30", "2019-10-01"],
    ],
    [
      "2020-02-25",
      "2020-03-01",
      [
        "2020-02-25",
        "2020-02-26",
        "2020-02-27",
        "2020-02-28",
        "2020-02-29",
        "2020-03-01",
      ],
    ],
  ])("getCivilDatesFromDateRange: %s", (from, to, output) => {
    expect(
      Timestamp.getCivilDatesFromDateRange({
        from: CivilDate.fromString(from),
        to: CivilDate.fromString(to),
      }),
    ).toStrictEqual(
      output.map((date) => {
        return CivilDate.fromString(date);
      }),
    );
  });

  test("midnight", () => {
    const date = Timestamp.midnight();

    expect(date.timestamp.getHours()).toBe(0);

    expect(date.timestamp.getMinutes()).toBe(0);

    expect(date.timestamp.getSeconds()).toBe(0);

    expect(date.timestamp.getMilliseconds()).toBe(0);
  });

  test("addDays", () => {
    const date = Timestamp.fromString(timestamp.toString());

    date.addDays(-4);

    expect(date.timestamp.getUTCDate()).toBe(31);
  });

  test("addMonths", () => {
    const date = Timestamp.fromString(timestamp.toString());

    date.addMonths(5);

    expect(date.timestamp.getUTCMonth()).toBe(10);
  });

  test("getDiffDays", () => {
    const now = Timestamp.now();
    const diff = Timestamp.now();
    diff.addDays(7);
    expect(now.getDiffDays(diff)).toBe(7);
    diff.addDays(-7);
    expect(now.getDiffDays(diff)).toBe(0);
  });

  test("getDiffMinutes", () => {
    const now = Timestamp.now();
    const diff = Timestamp.now();
    diff.addMinutes(60);
    expect(now.getDiffMinutes(diff)).toBe(60);
    diff.addMinutes(540);
    expect(now.getDiffMinutes(diff)).toBe(600);
    diff.addMinutes(-1200);
    expect(now.getDiffMinutes(diff)).toBe(-600);
  });

  test("getMonth", () => {
    expect(timestamp.getMonth()).toBe(6);

    expect(
      Timestamp.fromCivilDate(CivilDate.fromString("2020-06-28")).getMonth(),
    ).toBe(6);
  });

  test("getWeekday", () => {
    expect(timestamp.getWeekday()).toBe(4);

    expect(
      Timestamp.fromCivilDate(CivilDate.fromString("2020-06-28")).getWeekday(),
    ).toBe(7);
  });

  test("setDate", () => {
    const t = Timestamp.fromString(timestamp.toString());
    t.setDate(CivilDate.fromString("2020-08-24"));

    expect(t.toString()).toBe("2020-08-24T15:50:43.123Z");
  });

  test("toCivilDate", () => {
    const date = timestamp.toCivilDate();

    expect(date.toJSON()).toBe("2020-06-04");
  });

  test.each([
    ["2019-03-15", false, "2019-02-24", "2019-04-06"],
    ["2019-03-15", true, "2019-02-25", "2019-03-31"],
    ["2019-06-15", false, "2019-05-26", "2019-07-06"],
    ["2019-06-15", true, "2019-05-27", "2019-06-30"],
  ])("toCivilDateRangeCalendar: %s", (input, formatWeek8601, from, to) => {
    expect(
      Timestamp.fromCivilDate(
        CivilDate.fromString(input),
      ).toCivilDateRangeCalendar(formatWeek8601),
    ).toStrictEqual({
      from: CivilDate.fromString(from),
      to: CivilDate.fromString(to),
    });
  });

  test.each([
    [false, "2019-07-03", "2019-06-30", "2019-07-06"],
    [true, "2019-07-03", "2019-07-01", "2019-07-07"],
  ])("toCivilDateRangeWeek: %s", (formatWeek8601, input, from, to) => {
    expect(
      Timestamp.fromCivilDate(CivilDate.fromString(input)).toCivilDateRangeWeek(
        formatWeek8601,
      ),
    ).toStrictEqual({
      from: CivilDate.fromString(from),
      to: CivilDate.fromString(to),
    });
  });

  test.each([
    ["2019-06-30", false, "2019-07-07"],
    ["2019-06-30", true, "2019-06-23"],
  ])("toCivilDateWeekFrom: %s", (input, condition, output) => {
    expect(
      Timestamp.fromCivilDate(CivilDate.fromString(input)).toCivilDateWeekFrom(
        condition,
      ),
    ).toStrictEqual(CivilDate.fromString(output));
  });

  test("toCivilTime", () => {
    const time = timestamp.toCivilTime();

    expect(time.toString(true)).toBe("10:50");
  });

  test("toDay", () => {
    expect(
      Timestamp.fromCivilDate(CivilDate.fromString("2019-01-01")).toDay(),
    ).toBe("Tuesday");
    expect(
      Timestamp.fromCivilDate(CivilDate.fromString("2019-01-06")).toDay(),
    ).toBe("Sunday");
  });

  test.each([
    [
      "today",
      (): Timestamp => {
        return Timestamp.midnight();
      },
      (): string => {
        return "Today";
      },
    ],
    [
      "Sometime Today",
      (): Timestamp => {
        const t = Timestamp.midnight();
        t.addMinutes(1);
        return t;
      },
      (): string => {
        return "12:01 AM";
      },
    ],
    [
      "Tomorrow",
      (): Timestamp => {
        const t = Timestamp.now();
        t.addDays(1);
        return t;
      },
      (): string => {
        return "Tomorrow";
      },
    ],
    [
      "Next day",
      (): Timestamp => {
        const t = Timestamp.now();
        t.addDays(2);
        return t;
      },
      (): string => {
        const t = Timestamp.now();
        t.addDays(2);
        return Weekday.values[t.getWeekday()];
      },
    ],
    [
      "Next week day",
      (): Timestamp => {
        const t = Timestamp.now();
        t.addDays(6);
        return t;
      },
      (): string => {
        const t = Timestamp.now();
        t.addDays(6);

        if (t.getWeekday() === WeekdayEnum.None) {
          return Weekday.values[7];
        }

        return Weekday.values[t.getWeekday()];
      },
    ],
    [
      "Next week date",
      (): Timestamp => {
        const t = Timestamp.now();
        t.addDays(7);
        return t;
      },
      (): string => {
        const t = Timestamp.now();
        t.addDays(7);
        return `${Month.values[t.timestamp.getMonth() + 1]} ${t.timestamp.getDate()}`;
      },
    ],
    [
      "Next year",
      (): Timestamp => {
        const t = Timestamp.now();
        t.timestamp.setFullYear(t.timestamp.getFullYear() + 1);
        return t;
      },
      (): string => {
        const t = Timestamp.now();
        t.timestamp.setFullYear(t.timestamp.getFullYear() + 1);
        return `${Month.values[t.timestamp.getMonth() + 1]} ${t.timestamp.getDate()} ${t.timestamp.getFullYear()}`;
      },
    ],
  ])("toDueDate: %s", (_name, input, output) => {
    expect(input().toDueDate(false)).toBe(output());
  });

  test("toHTMLDate", () => {
    expect(timestamp.toHTMLDate()).toBe("2020-06-04T10:50");
  });

  test("toJSON", () => {
    const json = {
      timestamp: timestamp,
    };

    expect(JSON.stringify(json)).toBe(
      '{"timestamp":"2020-06-04T15:50:43.123Z"}',
    );
  });

  test("toString", () => {
    expect(timestamp.toString()).toBe("2020-06-04T15:50:43.123Z");
  });

  test.each([
    ["sunday", "2019-06-23", false],
    ["monday", "2019-06-24", true],
  ])("weekStart: %s", (_name, input, formatWeek8601) => {
    const output = Timestamp.fromCivilDate(CivilDate.fromString(input));

    for (let i = 0; i < 7; i++) {
      const date = Timestamp.fromString(output.toString());
      date.timestamp.setDate(date.timestamp.getDate() + i);
      expect(date.getWeekStart(formatWeek8601)).toStrictEqual(output);
    }
  });

  test("toPrettyString", () => {
    expect(
      timestamp.toPrettyString(
        CivilDateOrderEnum.YMD,
        CivilDateSeparatorEnum.Dash,
        true,
      ),
    ).toBe("2020-06-04 10:50");
  });
});
