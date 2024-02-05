import { AppState } from "@lib/states/App";

import { CivilDate } from "../types/CivilDate";
import { Recurrence } from "../types/Recurrence";
import { Timestamp } from "../types/Timestamp";
import { WeekdayEnum } from "../types/Weekday";
import { FormRecurrence } from "./FormRecurrence";

test("FormRecurrence", async () => {
  const start = Timestamp.fromCivilDate(CivilDate.fromString("2019-11-01"));
  let end = "";

  // Test future
  testing.mount(FormRecurrence, {
    recurrence: Recurrence.new(),
    startDate: start.toCivilDate().toJSON(),
  });
  testing.input("#form-item-input-recurrence-separation", "2");
  testing.input("#form-item-select-recurrence-every", "Days");
  await testing.sleep(100);
  testing.text("#form-item-input-next-date", "11/03/2019");

  const state = {
    endDate: start.toCivilDate().toJSON(),
    endDateInput: (e: string) => {
      end = e;
    },
    futureNext: true,
    recurrence: Recurrence.new(),
    startDate: start.toCivilDate().toJSON(),
  };
  testing.mount(FormRecurrence, state);
  testing.findAll(".Tooltips__tooltip", 1);
  const separation = testing.find("#form-item-input-recurrence-separation");
  const every = testing.find(
    "#form-item-select-recurrence-every",
  ) as HTMLSelectElement;
  const nextDate = testing.find("#form-item-input-next-date");
  testing.notFind("#form-label-recurrence-on");
  testing.notFind("#form-item-select-recurrence-month");
  testing.notFind("#form-item-select-recurrence-monthcadence");
  testing.notFind("#form-item-select-recurrence-days");
  testing.notFind("#form-item-select-recurrence-weekdays");
  expect(every.options).toHaveLength(4);

  // Test days
  testing.input(separation, "2");
  testing.input(every, "Days");
  await testing.sleep(100);
  testing.text(
    nextDate,
    AppState.formatCivilDate(
      Recurrence.nextFutureTimestamp(
        {
          ...Recurrence.new(),
          ...{
            separation: 2,
          },
        },
        start,
      ).toCivilDate(),
    ),
  );

  // Test weeks
  testing.input(every, "Weeks");
  await testing.sleep(100);
  testing.find("#form-label-recurrence-on");
  let weekdays = testing.find(
    "#form-item-select-recurrence-weekdays",
  ) as HTMLSelectElement;
  expect(weekdays.options).toHaveLength(7);
  testing.input(weekdays, "Saturday");
  state.recurrence.weekdays = [WeekdayEnum.Saturday];
  await testing.sleep(100);
  testing.text(
    "#form-item-input-next-date",
    AppState.formatCivilDate(
      Recurrence.nextFutureTimestamp(
        {
          ...Recurrence.new(),
          ...{
            separation: 2,
            weekdays: [WeekdayEnum.Saturday],
          },
        },
        start,
      ).toCivilDate(),
    ),
  );

  // Test months
  testing.input(every, "Months");
  await testing.sleep(100);
  testing.find("#form-label-recurrence-on");
  let monthcadence = testing.find(
    "#form-item-select-recurrence-monthcadence",
  ) as HTMLSelectElement;
  expect(monthcadence.options).toHaveLength(9);
  testing.input(monthcadence, "Specific Date");
  await testing.sleep(100);
  const day = testing.find("#form-item-input-recurrence-day");
  testing.input(day, "10");
  await testing.sleep(100);
  testing.text(
    nextDate,
    AppState.formatCivilDate(
      Recurrence.nextFutureTimestamp(
        {
          ...Recurrence.new(),
          ...{
            day: 10,
            separation: 2,
          },
        },
        start,
      ).toCivilDate(),
    ),
  );
  testing.input(day, "0");

  // Test years
  testing.input(every, "Years");
  await testing.sleep(100);
  testing.find("#form-label-recurrence-on");
  const months = testing.find(
    "#form-item-select-recurrence-month",
  ) as HTMLSelectElement;
  expect(months.options).toHaveLength(13);
  testing.input(months, "November");
  await testing.sleep(100);
  monthcadence = testing.find(
    "#form-item-select-recurrence-monthcadence",
  ) as HTMLSelectElement;
  testing.input(monthcadence, "Last");
  await testing.sleep(100);
  weekdays = testing.find(
    "#form-item-select-recurrence-weekdays",
  ) as HTMLSelectElement;
  testing.input(weekdays, "Saturday");
  await testing.sleep(100);
  testing.text(
    nextDate,
    AppState.formatCivilDate(
      Recurrence.nextFutureTimestamp(
        {
          ...Recurrence.new(),
          ...{
            month: 11,
            monthWeek: -1,
            separation: 2,
            weekday: WeekdayEnum.Saturday,
          },
        },
        start,
      ).toCivilDate(),
    ),
  );

  testing.value(
    "#form-item-input-end-recurrence-on",
    start.toCivilDate().toJSON(),
  );
  testing.input("#form-item-input-end-recurrence-on", CivilDate.now().toJSON());
  expect(end).toBe(CivilDate.now().toJSON());
});
