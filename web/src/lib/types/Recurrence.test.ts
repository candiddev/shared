import { CivilDate } from "./CivilDate";
import { Recurrence } from "./Recurrence";
import { Timestamp } from "./Timestamp";
import { WeekdayEnum } from "./Weekday";

describe("Recurrence", () => {
  test.each([
    [
      "none",
      {
        ...Recurrence.new(),
        ...{
          separation: 1,
        },
      },
      "2020-10-18",
      "2020-10-11",
      "2020-10-18",
      [],
      null,
      ["2020-10-18"],
    ],
    [
      "with end",
      {
        ...Recurrence.new(),
        ...{
          separation: 1,
        },
      },
      "2020-10-11",
      "2020-10-11",
      "2020-10-18",
      [],
      "2020-10-12",
      ["2020-10-11", "2020-10-12"],
    ],
    [
      "every 1 day",
      {
        ...Recurrence.new(),
        ...{
          separation: 1,
        },
      },
      "2020-09-01",
      "2020-10-18",
      "2020-10-18",
      [],
      null,
      ["2020-10-18"],
    ],
    [
      "every 2 days",
      {
        ...Recurrence.new(),
        ...{
          separation: 2,
        },
      },
      "2020-09-01",
      "2020-10-18",
      "2020-10-24",
      ["2020-10-19"],
      null,
      ["2020-10-21", "2020-10-23"],
    ],
    [
      "every 3 days",
      {
        ...Recurrence.new(),
        ...{
          separation: 3,
        },
      },
      "2020-09-01",
      "2020-10-18",
      "2020-10-24",
      [],
      null,
      ["2020-10-19", "2020-10-22"],
    ],
    [
      "every 7 days - same week",
      {
        ...Recurrence.new(),
        ...{
          separation: 7,
        },
      },
      "2020-10-19",
      "2020-10-18",
      "2020-10-24",
      [],
      null,
      ["2020-10-19"],
    ],
    [
      "every 7 days - next week",
      {
        ...Recurrence.new(),
        ...{
          separation: 7,
        },
      },
      "2020-10-11",
      "2020-10-18",
      "2020-10-24",
      [],
      null,
      ["2020-10-18"],
    ],
    [
      "every 1 week on monday and wednesday",
      {
        ...Recurrence.new(),
        ...{
          separation: 1,
          weekdays: [WeekdayEnum.Wednesday, WeekdayEnum.Monday],
        },
      },
      "2020-09-01",
      "2020-10-18",
      "2020-10-24",
      [],
      null,
      ["2020-10-19", "2020-10-21"],
    ],
    [
      "every 2 weeks on monday and wednesday",
      {
        ...Recurrence.new(),
        ...{
          separation: 2,
          weekdays: [WeekdayEnum.Wednesday, WeekdayEnum.Monday],
        },
      },
      "2020-09-01",
      "2020-10-11",
      "2020-10-24",
      [],
      null,
      ["2020-10-12", "2020-10-14"],
    ],
    [
      "every 1 month on day 3",
      {
        ...Recurrence.new(),
        ...{
          day: 3,
          separation: 1,
        },
      },
      "2020-01-01",
      "2020-08-30",
      "2020-10-03",
      [],
      null,
      ["2020-09-03", "2020-10-03"],
    ],
    [
      "every 3 months on day 3",
      {
        ...Recurrence.new(),
        ...{
          day: 3,
          separation: 3,
        },
      },
      "2020-01-01",
      "2020-08-30",
      "2020-10-03",
      [],
      null,
      ["2020-10-03"],
    ],
    [
      "every 1 month on first monday",
      {
        ...Recurrence.new(),
        ...{
          monthWeek: 1,
          separation: 1,
          weekday: WeekdayEnum.Monday,
        },
      },
      "2020-01-01",
      "2020-08-30",
      "2020-10-03",
      [],
      null,
      ["2020-09-07"],
    ],
    [
      "every 2 months on last friday",
      {
        ...Recurrence.new(),
        ...{
          monthWeek: -1,
          separation: 2,
          weekday: WeekdayEnum.Friday,
        },
      },
      "2020-01-01",
      "2020-08-30",
      "2020-10-03",
      [],
      null,
      ["2020-09-25"],
    ],
    [
      "every 3 months on third friday",
      {
        ...Recurrence.new(),
        ...{
          monthWeek: 3,
          separation: 3,
          weekday: WeekdayEnum.Friday,
        },
      },
      "2020-01-01",
      "2020-05-30",
      "2020-10-31",
      [],
      null,
      ["2020-07-17", "2020-10-16"],
    ],
    [
      "every 1 years on October 5",
      {
        ...Recurrence.new(),
        ...{
          day: 5,
          month: 10,
          separation: 1,
        },
      },
      "2020-01-01",
      "2020-05-30",
      "2020-10-31",
      [],
      null,
      ["2020-10-05"],
    ],
    [
      "every 2 years on October 5",
      {
        ...Recurrence.new(),
        ...{
          day: 5,
          month: 10,
          separation: 2,
        },
      },
      "2020-01-01",
      "2021-05-30",
      "2021-10-31",
      [],
      null,
      [],
    ],
    [
      "every 3 years on October 5",
      {
        ...Recurrence.new(),
        ...{
          day: 5,
          month: 10,
          separation: 3,
        },
      },
      "2020-01-01",
      "2023-01-01",
      "2023-12-31",
      [],
      null,
      ["2023-10-05"],
    ],
    [
      "every 1 year in October on second Thursday",
      {
        ...Recurrence.new(),
        ...{
          month: 10,
          monthWeek: 2,
          separation: 1,
          weekday: WeekdayEnum.Thursday,
        },
      },
      "2019-10-10",
      "2020-01-01",
      "2020-12-31",
      [],
      null,
      ["2020-10-08"],
    ],
    [
      "every 2 years in October on last Friday",
      {
        ...Recurrence.new(),
        ...{
          month: 10,
          monthWeek: -1,
          separation: 2,
          weekday: WeekdayEnum.Friday,
        },
      },
      "2020-01-01",
      "2021-01-01",
      "2021-12-31",
      [],
      null,
      [],
    ],
    [
      "every 3 years in October on last Friday",
      {
        ...Recurrence.new(),
        ...{
          month: 10,
          monthWeek: -1,
          separation: 3,
          weekday: WeekdayEnum.Friday,
        },
      },
      "2020-01-01",
      "2023-01-01",
      "2023-12-31",
      [],
      null,
      ["2023-10-27"],
    ],
    [
      "daylight savings",
      {
        ...Recurrence.new(),
        ...{
          month: 11,
          monthWeek: 1,
          separation: 1,
          weekday: WeekdayEnum.Sunday,
        },
      },
      "2021-11-10",
      "2021-11-30",
      "2021-11-30",
      [],
      null,
      [],
    ],
    [
      "thanksgiving missed",
      {
        ...Recurrence.new(),
        ...{
          month: 11,
          monthWeek: 4,
          separation: 1,
          weekday: WeekdayEnum.Thursday,
        },
      },
      "2021-11-03",
      "2021-11-23",
      "2021-11-23",
      [],
      null,
      [],
    ],
    [
      "thanksgiving after",
      {
        ...Recurrence.new(),
        ...{
          month: 11,
          monthWeek: 4,
          separation: 1,
          weekday: WeekdayEnum.Thursday,
        },
      },
      "2021-11-10",
      "2021-11-26",
      "2021-11-26",
      [],
      null,
      [],
    ],
    [
      "thanksgiving range",
      {
        ...Recurrence.new(),
        ...{
          month: 11,
          monthWeek: 4,
          separation: 1,
          weekday: WeekdayEnum.Thursday,
        },
      },
      "2021-11-10",
      "2021-11-21",
      "2021-11-27",
      [],
      null,
      ["2021-11-25"],
    ],
    [
      "earlier",
      {
        ...Recurrence.new(),
        ...{
          separation: 1,
        },
      },
      "2020-10-01",
      "2020-09-01",
      "2020-09-10",
      [],
      null,
      [],
    ],
    [
      "wide range",
      {
        ...Recurrence.new(),
        ...{
          month: 9,
          monthWeek: 1,
          separation: 1,
          weekday: 1,
        },
      },
      "2021-08-28",
      "2022-08-28",
      "2022-10-01",
      [],
      null,
      ["2022-09-05"],
    ],
    [
      "month week recursion bug",
      {
        ...Recurrence.new(),
        ...{
          monthWeek: 2,
          separation: 1,
          weekday: 3,
        },
      },
      "2022-10-10",
      "2023-05-01",
      "2023-05-20",
      ["2023-05-10"],
      null,
      [],
    ],
  ])(
    "findCivilDates: %s",
    (_name, recurrence, dateStart, dateFrom, dateTo, skipDays, end, output) => {
      expect(
        Recurrence.findCivilDates(
          recurrence,
          Timestamp.fromCivilDate(CivilDate.fromString(dateStart)),
          CivilDate.fromString(dateFrom),
          CivilDate.fromString(dateTo),
          skipDays,
          end,
        ),
      ).toStrictEqual(output);
    },
  );

  test("nextFutureTimestamp", () => {
    const t = Timestamp.now();
    t.addDays(-50);
    const output = Timestamp.now();
    output.addDays(2);

    expect(
      Recurrence.nextFutureTimestamp(
        {
          ...Recurrence.new(),
          ...{
            separation: 2,
          },
        },
        t,
      ),
    ).toStrictEqual(output);

    t.addDays(51);

    expect(
      Recurrence.nextFutureTimestamp(
        {
          ...Recurrence.new(),
          ...{
            separation: 1,
          },
        },
        t,
      ),
    ).toStrictEqual(output);

    t.addDays(1);

    expect(
      Recurrence.nextFutureTimestamp(
        {
          ...Recurrence.new(),
          ...{
            separation: 0,
          },
        },
        t,
      ),
    ).toStrictEqual(output);
  });

  test.each([
    [
      "none",
      {
        ...Recurrence.new(),
        ...{
          separation: 0,
        },
      },
      ["2020-10-14"],
      "2020-10-14",
    ],
    [
      "every 1 day",
      {
        ...Recurrence.new(),
        ...{
          separation: 1,
        },
      },
      ["2020-10-14"],
      "2020-10-15",
    ],
    [
      "every 2 days",
      {
        ...Recurrence.new(),
        ...{
          separation: 2,
        },
      },
      ["2020-10-14"],
      "2020-10-16",
    ],
    [
      "every 1 week on monday and wednesday",
      {
        ...Recurrence.new(),
        ...{
          separation: 1,
          weekdays: [WeekdayEnum.Wednesday, WeekdayEnum.Monday],
        },
      },
      ["2020-10-14", "2020-10-18"],
      "2020-10-19",
    ],
    [
      "every 1 week on tuesday and thursday",
      {
        ...Recurrence.new(),
        ...{
          separation: 1,
          weekdays: [WeekdayEnum.Thursday, WeekdayEnum.Tuesday],
        },
      },
      ["2020-10-13", "2020-10-14"],
      "2020-10-15",
    ],
    [
      "every 2 weeks on monday and wednesday",
      {
        ...Recurrence.new(),
        ...{
          separation: 2,
          weekdays: [WeekdayEnum.Wednesday, WeekdayEnum.Monday],
        },
      },
      ["2020-10-14", "2020-10-18"],
      "2020-10-26",
    ],
    [
      "every 2 weeks on tuesday and thursday",
      {
        ...Recurrence.new(),
        ...{
          separation: 2,
          weekdays: [WeekdayEnum.Thursday, WeekdayEnum.Tuesday],
        },
      },
      ["2020-10-13", "2020-10-14"],
      "2020-10-15",
    ],
    [
      "every 2 weeks on sunday",
      {
        ...Recurrence.new(),
        ...{
          separation: 2,
          weekdays: [7],
        },
      },
      ["2020-11-01"],
      "2020-11-15",
    ],
    [
      "every 1 month on day 31",
      {
        ...Recurrence.new(),
        ...{
          day: 31,
          separation: 1,
        },
      },
      ["2020-09-01", "2020-09-29"],
      "2020-09-30",
    ],
    [
      "every 2 months on day 2",
      {
        ...Recurrence.new(),
        ...{
          day: 2,
          separation: 2,
        },
      },
      ["2020-09-02", "2020-10-01"],
      "2020-11-02",
    ],
    [
      "every 1 month on first monday",
      {
        ...Recurrence.new(),
        ...{
          monthWeek: 1,
          separation: 1,
          weekday: WeekdayEnum.Monday,
        },
      },
      ["2020-09-08", "2020-10-04"],
      "2020-10-05",
    ],
    [
      "every 1 month on last friday",
      {
        ...Recurrence.new(),
        ...{
          monthWeek: -1,
          separation: 1,
          weekday: 5,
        },
      },
      ["2020-09-25", "2020-10-29"],
      "2020-10-30",
    ],
    [
      "every 2 months on second to last thursday",
      {
        ...Recurrence.new(),
        ...{
          monthWeek: -2,
          separation: 2,
          weekday: WeekdayEnum.Thursday,
        },
      },
      ["2020-09-17", "2020-10-21"],
      "2020-11-19",
    ],
    [
      "every 1 year on november 15",
      {
        ...Recurrence.new(),
        ...{
          day: 15,
          month: 11,
          separation: 1,
        },
      },
      ["2019-11-15", "2020-11-14"],
      "2020-11-15",
    ],
    [
      "every 1 year on november 16",
      {
        ...Recurrence.new(),
        ...{
          day: 16,
          month: 11,
          separation: 1,
        },
      },
      ["2020-11-16", "2021-11-15"],
      "2021-11-16",
    ],
    [
      "every 2 years on november 15",
      {
        ...Recurrence.new(),
        ...{
          day: 15,
          month: 11,
          separation: 2,
        },
      },
      ["2020-11-15", "2021-11-14"],
      "2022-11-15",
    ],
    [
      "every 1 year on last friday of october",
      {
        ...Recurrence.new(),
        ...{
          month: 10,
          monthWeek: -1,
          separation: 1,
          weekday: WeekdayEnum.Friday,
        },
      },
      ["2019-10-25", "2020-10-29"],
      "2020-10-30",
    ],
    [
      "every 1 year on first monday of october",
      {
        ...Recurrence.new(),
        ...{
          month: 10,
          monthWeek: 1,
          separation: 1,
          weekday: WeekdayEnum.Monday,
        },
      },
      ["2020-10-05", "2021-10-03"],
      "2021-10-04",
    ],
    [
      "every 1 year on first sunday in november",
      {
        ...Recurrence.new(),
        ...{
          month: 11,
          monthWeek: 1,
          separation: 1,
          weekday: WeekdayEnum.Sunday,
        },
      },
      ["2020-11-01"],
      "2021-11-07",
    ],
    [
      "every 1 year on fourth to last sunday in november",
      {
        ...Recurrence.new(),
        ...{
          month: 11,
          monthWeek: -4,
          separation: 1,
          weekday: WeekdayEnum.Sunday,
        },
      },
      ["2020-11-09"],
      "2021-11-07",
    ],
    [
      "every 2 years on last tuesday of october",
      {
        ...Recurrence.new(),
        ...{
          month: 10,
          monthWeek: -1,
          separation: 2,
          weekday: WeekdayEnum.Tuesday,
        },
      },
      ["2020-10-27", "2021-10-25"],
      "2022-10-25",
    ],
    [
      "every 1 monday in august",
      {
        ...Recurrence.new(),
        ...{
          month: 8,
          monthWeek: 1,
          separation: 1,
          weekday: WeekdayEnum.Monday,
        },
      },
      ["2021-10-25"],
      "2022-08-01",
    ],
  ])("nextTimestamp: %s", (_name, recurrence, inputs, output) => {
    for (const input of inputs) {
      const timestamp = Timestamp.fromCivilDate(CivilDate.fromString(input));

      expect(Recurrence.nextTimestamp(recurrence, timestamp)).toStrictEqual(
        Timestamp.fromCivilDate(CivilDate.fromString(output)),
      );
    }
  });
});
