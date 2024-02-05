import { YearMonth } from "./YearMonth";

export const CivilDateSeparator = ["/", "-", ".", ","];

export enum CivilDateSeparatorEnum {
  ForwardSlash,
  Dash,
  Period,
  Comma,
}

export class CivilDate {
  day: number;
  month: number;
  year: number;

  constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  static fromString(date: string): CivilDate {
    const iso = /^(\d{4})-(0[1-9]|1[0-12])-([0-2][0-9]|3[0-1])$/;
    const mdy = /^(0?[1-9]|1[0-12])\/([0-2]?[0-9]|3[0-1])\/([0-9]+)$/;

    let match = iso.exec(`${date}`);

    let year = 0;
    let month = 0;
    let day = 0;

    if (match === null) {
      match = mdy.exec(`${date}`);
      if (match === null) {
        return this.now();
      }

      year = parseInt(match[3], 10);
      month = parseInt(match[1], 10);
      day = parseInt(match[2], 10);
    } else {
      year = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      day = parseInt(match[3], 10);
    }

    return new CivilDate(year, month, day);
  }

  static now(): CivilDate {
    const date = new Date();
    return new CivilDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    );
  }

  getDay(): string {
    return `0${this.day}`.slice(-2);
  }

  getMonth(): string {
    return `0${this.month}`.slice(-2);
  }

  getYear(): string {
    return `000${this.year}`.slice(-4);
  }

  toJSON(): string {
    return this.toString(CivilDateOrderEnum.YMD, CivilDateSeparatorEnum.Dash);
  }

  toString(
    formatDateOrder: CivilDateOrderEnum,
    formatDateSeparator: CivilDateSeparatorEnum,
  ): string {
    let date: string[] = [];
    const separator = CivilDateSeparator[formatDateSeparator];

    switch (formatDateOrder) {
      case CivilDateOrderEnum.DMY:
        date = [this.getDay(), this.getMonth(), this.getYear()];
        break;
      case CivilDateOrderEnum.MDY:
        date = [this.getMonth(), this.getDay(), this.getYear()];
        break;
      case CivilDateOrderEnum.YMD:
        date = [this.getYear(), this.getMonth(), this.getDay()];
        break;
    }

    return date.join(separator);
  }

  toYearMonth(): YearMonth {
    return new YearMonth(this.year, this.month);
  }

  valueOf(): number {
    return parseInt(`${this.year}${this.getMonth()}${this.getDay()}`);
  }
}

export enum CivilDateOrderEnum {
  MDY,
  DMY,
  YMD,
}
