import { Clone } from "../utilities/Clone";
import { CivilDate } from "./CivilDate";
import { MonthEnum } from "./Month";
import { Timestamp } from "./Timestamp";
import { WeekdayEnum } from "./Weekday";

enum RecurrenceType {
  Separation,
  Weekdays,
  Day,
  WeekdayMonthWeek,
  DayMonth,
  WeekdayMonthWeekMonth,
}

const checkSkipDays = (date: Timestamp, skipDays: string[]): boolean => {
  return !skipDays.includes(date.toCivilDate().toJSON());
};

const getLastDay = (t: Timestamp): number => {
  const lastDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (t.timestamp.getFullYear() % 4 === 0) {
    lastDays[1] = 29;
  }

  return lastDays[t.timestamp.getMonth()];
};

const getMonthWeek = (t: Timestamp, last: boolean): number => {
  let week = 0;
  if (last) {
    week = Math.ceil((getLastDay(t) - t.timestamp.getDate()) / 7);

    if (week === 0) {
      return -1;
    }

    return week * -1;
  }

  week = Math.ceil(t.timestamp.getDate() / 7);

  if (week === 0) {
    return 1;
  }

  return week;
};

const setDay = (t: Timestamp, day: number): void => {
  let d = day;
  const lastDay = getLastDay(t);
  if (d > lastDay) {
    d = lastDay;
  }

  if (t.timestamp.getDate() > d) {
    t.addDays(lastDay - t.timestamp.getDate() + d);
  } else if (t.timestamp.getDate() < d) {
    t.addDays(d - t.timestamp.getDate());
  }
};

const setMonth = (t: Timestamp, month: MonthEnum): void => {
  if (t.getMonth() > month) {
    setDay(t, 1);
    t.addMonths(12 - t.getMonth() + month);
  } else if (t.getMonth() < month) {
    setDay(t, 1);
    t.addMonths(month - t.getMonth());
  }
};

const setWeekday = (t: Timestamp, day: WeekdayEnum): void => {
  if (t.getWeekday() > day) {
    t.addDays(7 - t.getWeekday() + day);
  } else if (t.getWeekday() < day) {
    t.addDays(day - t.getWeekday());
  }
};

const setMonthweekWeekday = (
  t: Timestamp,
  monthweek: number,
  weekday: number,
): void => {
  setWeekday(t, weekday);
  let startWeek = getMonthWeek(t, monthweek < 0);

  if (monthweek > 0) {
    if (startWeek > monthweek) {
      setDay(t, 1);
      setWeekday(t, weekday);
      startWeek = getMonthWeek(t, monthweek < 0);
    }

    t.addDays(7 * (monthweek - startWeek));
  } else {
    if (startWeek > monthweek) {
      setDay(t, 1);
      setWeekday(t, weekday);
      startWeek = getMonthWeek(t, monthweek < 0);
    }

    t.addDays(7 * (monthweek - startWeek));
  }
};

export interface RecurrenceInterval {
  /** The day of the month to recur on. */
  day: number;

  /** The month to recur on. */
  month: MonthEnum;

  /** The month week (-4 - 4) to recur on. */
  monthWeek: number;

  /** The number of recurrences to separate on.  Setting this to 0 disables recurrence. */
  separation: number;

  /** The weekday to recur on (1-7, 0 disables, 1 is monday). */
  weekday: WeekdayEnum;

  /** A list of weekdays to recur on for weekly recurrences. */
  weekdays: WeekdayEnum[] | null;
}

export const Recurrence = {
  findCivilDates: (
    recurrence: RecurrenceInterval,
    dateStart: Timestamp,
    dateFrom: CivilDate,
    dateTo: CivilDate,
    skipDays: string[],
    recurrenceEnd: NullCivilDate,
  ): string[] => {
    let from = Timestamp.fromCivilDate(dateFrom);
    let end = from.toCivilDate();
    let to = Timestamp.fromCivilDate(dateTo);
    const start = Timestamp.fromString(dateStart.toString());
    start.timestamp.setHours(0);
    start.timestamp.setMinutes(0);
    start.timestamp.setSeconds(0);
    start.timestamp.setMilliseconds(0);

    const recurrences: string[] = [];

    if (recurrenceEnd !== null) {
      end = CivilDate.fromString(recurrenceEnd);
      if (end.valueOf() < to.toCivilDate().valueOf()) {
        to = Timestamp.fromCivilDate(end);
      }
    }

    if (
      to.toCivilDate().valueOf() < start.toCivilDate().valueOf() ||
      from.toCivilDate().valueOf() > end.valueOf()
    ) {
      return [];
    }

    if (from.toCivilDate().valueOf() <= start.toCivilDate().valueOf()) {
      recurrences.push(start.toCivilDate().toJSON());
      from = Timestamp.fromString(start.toString());
      from.addDays(1);
    }

    switch (Recurrence.getRecurrenceType(recurrence)) {
      case RecurrenceType.Separation:
        while (from.toCivilDate().valueOf() <= to.toCivilDate().valueOf()) {
          const diff = from.getDiffDays(start);
          const remainder = diff % recurrence.separation;

          if (remainder === 0 && checkSkipDays(from, skipDays)) {
            recurrences.push(from.toCivilDate().toJSON());
          }

          from.addDays(1);
        }
        break;
      case RecurrenceType.Weekdays:
        while (from.toCivilDate().valueOf() <= to.toCivilDate().valueOf()) {
          const diff = Math.round(
            Math.abs(
              (from.timestamp.getTime() - start.timestamp.getTime()) /
                (7 * 24 * 60 * 60 * 1000),
            ),
          );
          const remainder = diff % recurrence.separation;

          if (
            remainder === 0 &&
            recurrence.weekdays!.includes(from.getWeekday()) && // eslint-disable-line @typescript-eslint/no-non-null-assertion
            checkSkipDays(from, skipDays)
          ) {
            recurrences.push(from.toCivilDate().toJSON());
          }

          from.addDays(1);
        }
        break;
      case RecurrenceType.Day:
        while (from.toCivilDate().valueOf() <= to.toCivilDate().valueOf()) {
          let diff =
            (from.timestamp.getFullYear() - start.timestamp.getFullYear()) * 12;
          diff += from.getMonth() - start.getMonth();
          const remainder = diff % recurrence.separation;

          if (from.timestamp.getDate() !== recurrence.day) {
            setDay(from, recurrence.day);
            continue;
          }

          if (
            remainder === 0 &&
            from.timestamp.getDate() === recurrence.day &&
            checkSkipDays(from, skipDays)
          ) {
            recurrences.push(from.toCivilDate().toJSON());
          }

          from.addMonths(1);
        }
        break;
      case RecurrenceType.WeekdayMonthWeek:
        while (from.toCivilDate().valueOf() <= to.toCivilDate().valueOf()) {
          let diff =
            (from.timestamp.getFullYear() - start.timestamp.getFullYear()) * 12;
          diff += from.getMonth() - start.getMonth();
          const remainder = diff % recurrence.separation;
          const week = getMonthWeek(from, recurrence.monthWeek < 0);

          if (remainder !== 0 || week > recurrence.monthWeek) {
            if (from.timestamp.getDate() === 1) {
              from.addDays(1);
            }

            setDay(from, 1);
            continue;
          }

          if (
            week === recurrence.monthWeek &&
            from.getWeekday() === recurrence.weekday
          ) {
            if (checkSkipDays(from, skipDays)) {
              recurrences.push(from.toCivilDate().toJSON());
            }

            if (from.timestamp.getDate() === 1) {
              from.addDays(1);
            }
            setDay(from, 1);
            continue;
          }

          setMonthweekWeekday(from, recurrence.monthWeek, recurrence.weekday);
        }
        break;
      case RecurrenceType.DayMonth:
        while (from.toCivilDate().valueOf() <= to.toCivilDate().valueOf()) {
          const diff =
            from.timestamp.getFullYear() - start.timestamp.getFullYear();
          const remainder = diff % recurrence.separation;

          if (
            from.timestamp.getDate() !== recurrence.day ||
            from.getMonth() !== recurrence.month
          ) {
            setDay(from, recurrence.day);
            setMonth(from, recurrence.month);
            continue;
          }

          if (remainder === 0 && checkSkipDays(from, skipDays)) {
            recurrences.push(from.toCivilDate().toJSON());
          }

          from.addMonths(12);
        }
        break;
      case RecurrenceType.WeekdayMonthWeekMonth:
        while (from.toCivilDate().valueOf() <= to.toCivilDate().valueOf()) {
          setMonth(from, recurrence.month);
          setMonthweekWeekday(from, recurrence.monthWeek, recurrence.weekday);

          const diff =
            from.timestamp.getFullYear() - start.timestamp.getFullYear();
          const remainder = diff % recurrence.separation;
          const monthWeek = getMonthWeek(from, recurrence.monthWeek < 0);
          const weekday = from.getWeekday();

          if (
            remainder === 0 &&
            checkSkipDays(from, skipDays) &&
            from.getMonth() === recurrence.month &&
            monthWeek === recurrence.monthWeek &&
            weekday === recurrence.weekday &&
            from.toCivilDate().valueOf() <= to.toCivilDate().valueOf()
          ) {
            recurrences.push(from.toCivilDate().toJSON());
          }

          from.addMonths(11);
          setDay(from, 1);
        }
    }

    return recurrences;
  },
  getRecurrenceType: (recurrence: RecurrenceInterval): RecurrenceType => {
    if (
      recurrence.day === 0 &&
      recurrence.month === MonthEnum.None &&
      recurrence.monthWeek === 0 &&
      recurrence.separation !== 0 &&
      recurrence.weekday === WeekdayEnum.None &&
      recurrence.weekdays !== null &&
      recurrence.weekdays.length > 0
    ) {
      return RecurrenceType.Weekdays;
    }

    if (
      recurrence.day !== 0 &&
      recurrence.month === MonthEnum.None &&
      recurrence.monthWeek === 0 &&
      recurrence.separation !== 0 &&
      recurrence.weekday === WeekdayEnum.None &&
      recurrence.weekdays === null
    ) {
      return RecurrenceType.Day;
    }

    if (
      recurrence.day === 0 &&
      recurrence.month === MonthEnum.None &&
      recurrence.monthWeek !== 0 &&
      recurrence.separation !== 0 &&
      recurrence.weekday !== WeekdayEnum.None &&
      recurrence.weekdays === null
    ) {
      return RecurrenceType.WeekdayMonthWeek;
    }

    if (
      recurrence.day !== 0 &&
      recurrence.month !== MonthEnum.None &&
      recurrence.monthWeek === 0 &&
      recurrence.separation !== 0 &&
      recurrence.weekday === WeekdayEnum.None &&
      recurrence.weekdays === null
    ) {
      return RecurrenceType.DayMonth;
    }

    if (
      recurrence.day === 0 &&
      recurrence.month !== MonthEnum.None &&
      recurrence.monthWeek !== 0 &&
      recurrence.separation !== 0 &&
      recurrence.weekday !== WeekdayEnum.None &&
      recurrence.weekdays === null
    ) {
      return RecurrenceType.WeekdayMonthWeekMonth;
    }

    return RecurrenceType.Separation;
  },
  new: (): RecurrenceInterval => {
    return {
      day: 0,
      month: 0,
      monthWeek: 0,
      separation: 0,
      weekday: 0,
      weekdays: null,
    };
  },
  nextCivilDate: (
    recurrence: RecurrenceInterval,
    civilDate: CivilDate,
  ): CivilDate => {
    return Recurrence.nextFutureTimestamp(
      recurrence,
      Timestamp.fromCivilDate(civilDate),
    ).toCivilDate();
  },
  nextFutureTimestamp: (
    recurrence: RecurrenceInterval,
    oldTimestamp: Timestamp,
  ): Timestamp => {
    const now = Timestamp.now();
    let timestamp = oldTimestamp;

    if (recurrence.separation === 0) {
      return oldTimestamp;
    }

    while (
      timestamp.timestamp.valueOf() <= now.timestamp.valueOf() ||
      timestamp.timestamp.valueOf() <= oldTimestamp.timestamp.valueOf()
    ) {
      timestamp = Recurrence.nextTimestamp(recurrence, timestamp);
    }

    return timestamp;
  },
  nextTimestamp: (
    recurrence: RecurrenceInterval,
    oldTimestamp: Timestamp,
  ): Timestamp => {
    const r = Clone(recurrence);
    let timestamp = Timestamp.fromString(oldTimestamp.toString());

    if (recurrence.separation === 0) {
      return oldTimestamp;
    }

    if (r.weekdays !== null) {
      r.weekdays.sort((a, b) => {
        return a - b;
      });
    }

    switch (Recurrence.getRecurrenceType(recurrence)) {
      case RecurrenceType.Separation:
        timestamp.addDays(r.separation);

        break;
      case RecurrenceType.Weekdays:
        if (
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          r.weekdays!.every((weekday) => {
            return timestamp.getWeekday() >= weekday;
          })
        ) {
          timestamp.addDays(7 * (r.separation - 1));
        }

        timestamp.addDays(1);

        while (
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          r.weekdays!.every((weekday) => {
            return timestamp.getWeekday() !== weekday;
          })
        ) {
          timestamp.addDays(1);
        }

        break;
      case RecurrenceType.Day:
        timestamp.addDays(1);
        setDay(timestamp, r.day);
        timestamp.addMonths(r.separation - 1);
        setDay(timestamp, r.day);

        break;
      case RecurrenceType.WeekdayMonthWeek:
        while (r.separation > 0) {
          timestamp.addDays(1);
          const next = Timestamp.fromString(timestamp.toString());
          next.timestamp.setDate(1);
          setMonthweekWeekday(next, r.monthWeek, r.weekday);

          if (next < timestamp) {
            next.timestamp.setDate(1);
            next.addMonths(1);
            setMonthweekWeekday(next, r.monthWeek, r.weekday);
          }

          timestamp = next;

          r.separation -= 1;
        }

        break;
      case RecurrenceType.DayMonth:
        timestamp.addDays(1);
        setDay(timestamp, r.day);

        if (r.month < timestamp.getMonth()) {
          timestamp.addMonths(1 * (12 + r.month - timestamp.getMonth()));
        } else if (r.month > timestamp.getMonth()) {
          timestamp.addMonths(1 * (r.month - timestamp.getMonth()));
        }

        timestamp.addMonths(12 * (r.separation - 1));

        break;
      case RecurrenceType.WeekdayMonthWeekMonth:
        while (r.separation > 0) {
          timestamp.addDays(1);
          const next = Timestamp.fromString(timestamp.toString());
          next.timestamp.setDate(1);
          next.timestamp.setMonth(r.month - 1);
          setMonthweekWeekday(next, r.monthWeek, r.weekday);

          if (next < timestamp) {
            next.timestamp.setDate(1);
            next.addMonths(12);
            setMonthweekWeekday(next, r.monthWeek, r.weekday);
          }

          timestamp = next;

          r.separation -= 1;
        }
    }

    return timestamp;
  },
  validate: (recurrence: RecurrenceInterval): boolean => {
    if (recurrence.day > 31 || recurrence.day < -31) {
      return false;
    }

    if (recurrence.separation < 0) {
      return false;
    }

    if (recurrence.monthWeek < -4 || recurrence.monthWeek > 4) {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (recurrence.month > 12 || recurrence.month < -12) {
      return false;
    }
    if (recurrence.weekdays !== null) {
      const days: WeekdayEnum[] = [];
      for (const day of recurrence.weekdays) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        if (day > 7 || day < -7) {
          return false;
        }

        if (days.includes(day)) {
          return false;
        }

        days.push(day);
      }
    }
    return true;
  },
};
