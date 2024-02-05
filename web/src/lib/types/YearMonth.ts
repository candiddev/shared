import { Month } from "./Month";

export interface YearMonthDateRange {
  /** Start of range. */
  from: YearMonth;

  /** End of range. */
  to: YearMonth;
}

export class YearMonth {
  month: number;
  year: number;

  constructor(year: number, month: number) {
    this.year = year;
    this.month = month;
  }

  static fromNumber(yearMonth: number): YearMonth {
    const regex = /^(\d{4})(0[1-9]|1[0-12])$/;

    const match = regex.exec(yearMonth.toString());

    if (match === null) {
      return new YearMonth(0, 0);
    }

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);

    return new YearMonth(year, month);
  }

  addMonths(months: number): YearMonth {
    let year = this.year;

    let month = this.month;

    month += months;

    while (month > 12) {
      month -= 12;
      year++;
    }

    while (month < 1) {
      month += 12;
      year--;
    }
    return new YearMonth(year, month);
  }

  getMonth(): string {
    return `0${this.month}`.slice(-2);
  }

  getYear(): string {
    return `000${this.year}`.slice(-4);
  }

  fromInput(i: string): void {
    if (i.length > 7) {
      return;
    }

    const month = parseInt(i.split("-")[1]);
    const year = parseInt(i.split("-")[0]);

    if (year > 0) {
      this.year = year;
    }

    if (month > 0) {
      this.month = month;
    }

    if (year === 0 && month === 0) {
      this.month = 0;
      this.year = 0;
    }
  }

  toNumber(): number {
    return parseInt(`${this.getYear()}${this.getMonth()}`, 10);
  }

  toString(): string {
    return `${Month.values[this.month]} ${this.getYear()}`;
  }

  toValue(): string {
    return `${this.getYear()}-${this.getMonth()}`;
  }

  valueOf(): number {
    return this.toNumber();
  }
}
