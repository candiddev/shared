import { YearMonth } from "./YearMonth";

describe("YearMonth", () => {
  test.each([
    ["one", 1, 201911],
    ["year+", 10, 202008],
    ["year-", -10, 201812],
  ])("addMonths: %s", (_name, input, output) => {
    const yearMonth = YearMonth.fromNumber(201910);

    expect(yearMonth.addMonths(input).toNumber()).toBe(output);
  });

  test("fromNumber", () => {
    expect(YearMonth.fromNumber(202006)).toStrictEqual(new YearMonth(2020, 6));
  });

  test.each([
    ["valid-year", "2019-00", 201910],
    ["valid-month", "0000-02", 202002],
    ["valid", "2019-09", 201909],
    ["invalid", "0000-00", 0],
  ])("fromInput: %s", (_name, input, output) => {
    const yearMonth = YearMonth.fromNumber(202010);
    yearMonth.fromInput(input);
    expect(yearMonth.toNumber()).toBe(output);
  });

  test("toNumber", () => {
    expect(new YearMonth(2020, 6).toNumber()).toBe(202006);
  });

  test("toString", () => {
    let yearMonth = new YearMonth(2020, 6);
    expect(yearMonth.toString()).toBe("June 2020");
    yearMonth = new YearMonth(1, 6);
    expect(yearMonth.toString()).toBe("June 0001");
  });
});
