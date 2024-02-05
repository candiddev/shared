import {
  CivilDate,
  CivilDateOrderEnum,
  CivilDateSeparatorEnum,
} from "./CivilDate";
import { YearMonth } from "./YearMonth";

describe("CivilDate", () => {
  const today = CivilDate.now();
  test.each([
    ["iso-wrong", "2020-15-19", today.toJSON()],
    ["iso-ok", "2022-05-19", "2022-05-19"],
    ["mdy-wrong", "15/19/2022", today.toJSON()],
    ["mdy-no padding", "5/9/2022", "2022-05-09"],
    ["mdy-with padding", "05/09/2022", "2022-05-09"],
  ])("fromString: %s", (_name, input, output) => {
    const date = CivilDate.fromString(input);
    expect(date.toJSON()).toBe(output);
  });

  test("toJSON", () => {
    const json = {
      date: new CivilDate(2020, 6, 19),
    };

    expect(JSON.stringify(json)).toBe('{"date":"2020-06-19"}');
  });

  test("toString", () => {
    let date = new CivilDate(2020, 6, 19);

    expect(
      date.toString(
        CivilDateOrderEnum.MDY,
        CivilDateSeparatorEnum.ForwardSlash,
      ),
    ).toBe("06/19/2020");
    expect(
      date.toString(CivilDateOrderEnum.YMD, CivilDateSeparatorEnum.Dash),
    ).toBe("2020-06-19");

    date = new CivilDate(1, 6, 19);
    expect(
      date.toString(CivilDateOrderEnum.DMY, CivilDateSeparatorEnum.Period),
    ).toBe("19.06.0001");
  });

  test("toYearMonth", () => {
    const date = new CivilDate(2020, 6, 19);

    expect(date.toYearMonth()).toStrictEqual(new YearMonth(2020, 6));
  });
});
