import type { CivilDateOrderEnum, CivilDateSeparatorEnum } from "./CivilDate";
import { CivilDate } from "./CivilDate";
import { CivilTime } from "./CivilTime";
import type { MonthEnum } from "./Month";
import { Month } from "./Month";
import type { WeekdayEnum } from "./Weekday";
import { Weekday } from "./Weekday";

interface CivilDateRange {
  from: CivilDate;
  to: CivilDate;
}

export class Timestamp {
  timestamp: Date;

  constructor(timestamp: Date) {
    this.timestamp = timestamp;
  }

  static fromCivilDate(date: CivilDate): Timestamp {
    return new Timestamp(
      new Date(date.year, date.month - 1, date.day, 0, 0, 0),
    );
  }

  static fromString(timestamp: string): Timestamp {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3,6})?Z$/;

    const match = regex.exec(`${timestamp}`);

    if (match === null) {
      return this.now();
    }

    return new Timestamp(new Date(`${timestamp}`));
  }

  static getCivilDatesFromDateRange(dateRange: CivilDateRange): CivilDate[] {
    const civilDates: CivilDate[] = [];
    const t = Timestamp.fromCivilDate(dateRange.to);
    const f = Timestamp.fromCivilDate(dateRange.from);

    while (f.timestamp <= t.timestamp) {
      civilDates.push(f.toCivilDate());
      f.addDays(1);
    }

    return civilDates;
  }

  static midnight(timestamp?: string): Timestamp {
    let date = Timestamp.now();

    if (timestamp !== undefined) {
      date = Timestamp.fromString(timestamp);
    }

    date.toMidnight();

    return date;
  }

  static now(): Timestamp {
    return new Timestamp(new Date());
  }

  addDays(days: number): void {
    this.timestamp.setDate(this.timestamp.getDate() + days);
  }

  addMinutes(minutes: number): void {
    this.timestamp.setMinutes(this.timestamp.getMinutes() + minutes);
  }

  addMonths(months: number): void {
    this.timestamp.setMonth(this.timestamp.getMonth() + months);
  }

  getDiffDays(t: Timestamp): number {
    return Math.round(
      Math.abs(
        (t.timestamp.getTime() - this.timestamp.getTime()) /
          (24 * 60 * 60 * 1000),
      ),
    );
  }

  getDiffMinutes(t: Timestamp): number {
    return Math.floor(
      (t.timestamp.getTime() - this.timestamp.getTime()) / 60000,
    );
  }

  getMonth(): MonthEnum {
    return this.timestamp.getMonth() + 1;
  }

  getWeekStart(formatWeek8601: boolean): Timestamp {
    const d = new Date(this.timestamp.getTime());

    if (d.getDay() !== 0 && (formatWeek8601 === undefined || !formatWeek8601)) {
      d.setDate(d.getDate() - d.getDay());
    }

    if (d.getDay() !== 1 && formatWeek8601 !== undefined && formatWeek8601) {
      let a = 1;
      if (d.getDay() === 0) {
        a = -6;
      }
      d.setDate(d.getDate() - d.getDay() + a);
    }

    return new Timestamp(d);
  }

  getWeekday(): WeekdayEnum {
    if (this.timestamp.getDay() === 0) {
      return 7;
    }

    return this.timestamp.getDay();
  }

  setDate(date: CivilDate): void {
    this.timestamp = new Date(
      date.year,
      date.month - 1,
      date.day,
      this.timestamp.getHours(),
      this.timestamp.getMinutes(),
      this.timestamp.getSeconds(),
      this.timestamp.getMilliseconds(),
    );
  }

  toCivilDate(): CivilDate {
    return new CivilDate(
      this.timestamp.getFullYear(),
      this.timestamp.getMonth() + 1,
      this.timestamp.getDate(),
    );
  }

  toCivilDateRangeCalendar(formatWeek8601: boolean): CivilDateRange {
    let from = new Timestamp(
      new Date(this.timestamp.getFullYear(), this.timestamp.getMonth(), 1),
    );
    from = from.getWeekStart(formatWeek8601);

    const to = new Timestamp(
      new Date(this.timestamp.getFullYear(), this.timestamp.getMonth() + 1, 0),
    );
    const toEnd = to.getWeekStart(formatWeek8601);

    if (
      to.timestamp.getTime() === toEnd.timestamp.getTime() ||
      to.timestamp.getTime() > toEnd.timestamp.getTime()
    ) {
      toEnd.timestamp.setDate(toEnd.timestamp.getDate() + 6);
    }

    return {
      from: from.toCivilDate(),
      to: toEnd.toCivilDate(),
    };
  }

  toCivilDateRangeWeek(formatWeek8601: boolean): CivilDateRange {
    const from = this.getWeekStart(formatWeek8601);

    const to = Timestamp.fromString(from.toString());
    to.addDays(6);

    return {
      from: from.toCivilDate(),
      to: to.toCivilDate(),
    };
  }

  toCivilDateWeekFrom(previous: boolean): CivilDate {
    const d = Timestamp.fromString(this.toString());

    if (previous) {
      d.addDays(-7);
    } else {
      d.addDays(7);
    }

    return d.toCivilDate();
  }

  toCivilTime(): CivilTime {
    return new CivilTime(
      this.timestamp.getHours(),
      this.timestamp.getMinutes(),
    );
  }

  toDay(): string {
    if (this.timestamp.getDay() === 0) {
      return Weekday.values[7];
    }

    return Weekday.values[this.timestamp.getDay()];
  }

  toDueDate(formatTime24: boolean): string {
    const now = Timestamp.now();

    if (
      now.timestamp.getFullYear() === this.timestamp.getFullYear() &&
      now.timestamp.getMonth() === this.timestamp.getMonth() &&
      now.timestamp.getDate() === this.timestamp.getDate()
    ) {
      if (
        this.timestamp.getHours() === 0 &&
        this.timestamp.getMinutes() === 0
      ) {
        return "Today";
      }

      return this.toCivilTime().toString(formatTime24);
    }

    const weekAfter = Timestamp.fromString(now.toString());
    weekAfter.addDays(7);
    const yearBefore = Timestamp.fromString(now.toString());
    yearBefore.addMonths(-11);
    const yearAfter = Timestamp.fromString(now.toString());
    yearAfter.addMonths(11);
    const tomorrow = Timestamp.fromString(now.toString());
    tomorrow.addDays(1);

    if (
      this.timestamp < weekAfter.timestamp &&
      this.timestamp > now.timestamp
    ) {
      if (this.timestamp.getDate() === tomorrow.timestamp.getDate()) {
        return "Tomorrow";
      }

      return this.toDay();
    }

    if (
      this.timestamp < yearAfter.timestamp &&
      this.timestamp > yearBefore.timestamp
    ) {
      return `${Month.values[this.timestamp.getMonth() + 1]} ${this.timestamp.getDate()}`;
    }

    return `${Month.values[this.timestamp.getMonth() + 1]} ${this.timestamp.getDate()} ${this.timestamp.getFullYear()}`;
  }

  toHTMLDate(): string {
    return `${this.timestamp.getFullYear()}-${`0${this.timestamp.getMonth() + 1}`.slice(-2)}-${`0${this.timestamp.getDate()}`.slice(-2)}T${`0${this.timestamp.getHours()}`.slice(-2)}:${`0${this.timestamp.getMinutes()}`.slice(-2)}`;
  }

  toJSON(): string {
    return this.toString();
  }

  toMidnight(): void {
    this.timestamp.setHours(0);
    this.timestamp.setMinutes(0);
    this.timestamp.setSeconds(0);
    this.timestamp.setMilliseconds(0);
  }

  toString(): string {
    return this.timestamp.toISOString();
  }

  toPrettyString(
    formatDateOrder: CivilDateOrderEnum,
    formatDateSeparator: CivilDateSeparatorEnum,
    formatTime24: boolean,
  ): string {
    return `${this.toCivilDate().toString(
      formatDateOrder,
      formatDateSeparator,
    )} ${this.toCivilTime().toString(formatTime24)}`;
  }
}
