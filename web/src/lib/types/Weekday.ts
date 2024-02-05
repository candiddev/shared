import { AppState } from "@lib/states/App";

export const Weekday = {
  getValues(formatWeek8601: boolean): string[] {
    return formatWeek8601
      ? AppState.data.translations.formRecurrenceWeekdays
      : [
          AppState.data.translations.formRecurrenceWeekdays[6],
          ...AppState.data.translations.formRecurrenceWeekdays.slice(0, 6),
        ];
  },
  values: [
    "",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
};

export enum WeekdayEnum {
  None,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}
