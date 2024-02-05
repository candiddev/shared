export class CivilTime {
  hour: number;
  minute: number;

  constructor(hour: number, minute: number) {
    this.hour = hour;
    this.minute = minute;
  }

  static fromString(time: string): CivilTime {
    const regex = /^([0-1][0-9]|2[0-3]):([0-5]\d)$/;

    const match = regex.exec(time);

    if (match === null) {
      return this.now();
    }

    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);

    return new CivilTime(hour, minute);
  }

  static now(): CivilTime {
    const date = new Date();
    return new CivilTime(date.getHours(), date.getMinutes());
  }

  getMinute(): string {
    return `0${this.minute}`.slice(-2);
  }

  toJSON(): string {
    return this.toString(true);
  }

  toString(formatTime24: boolean): string {
    const minute = `0${this.minute}`.slice(-2);

    if (formatTime24) {
      const hour = `0${this.hour}`.slice(-2);

      return `${hour}:${minute}`;
    }

    if (this.hour > 12) {
      return `${this.hour - 12}:${minute} PM`;
    }

    if (this.hour === 12) {
      return `12:${minute} PM`;
    }

    if (this.hour === 0) {
      return `12:${minute} AM`;
    }

    return `${this.hour}:${minute} AM`;
  }

  valueOf(): number {
    return parseInt(`${this.hour}${this.getMinute()}`);
  }
}
