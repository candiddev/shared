import { CivilTime } from "./CivilTime";

describe("CivilTime", () => {
  test("fromString", () => {
    let time = CivilTime.fromString("24:22");
    expect(time).toStrictEqual(CivilTime.now());

    time = CivilTime.fromString("23:59");
    expect(time.hour).toBe(23);
    expect(time.minute).toBe(59);
  });

  test("toJSON", () => {
    const json = {
      time: new CivilTime(23, 59),
    };

    expect(JSON.stringify(json)).toBe('{"time":"23:59"}');
  });

  test("toString", () => {
    let time = new CivilTime(23, 59);

    expect(time.toString(false)).toBe("11:59 PM");
    expect(time.toString(true)).toBe("23:59");

    time = new CivilTime(12, 0);

    expect(time.toString(false)).toBe("12:00 PM");
    expect(time.toString(true)).toBe("12:00");
  });

  test("valueOf", () => {
    let time = new CivilTime(23, 59);

    expect(time.valueOf()).toBe(2359);

    time = new CivilTime(8, 0);

    expect(time.valueOf()).toBe(800);
  });
});
