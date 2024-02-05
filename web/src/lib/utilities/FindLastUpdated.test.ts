import { FindLastUpdated } from "./FindLastUpdated";

describe("FindLastUpdated", () => {
  test("newest timestamp", () => {
    const input = [
      {
        updated: "2019-01-01T12:00:00.000000Z",
      },
      {
        updated: "2019-01-01T13:00:00.000000Z",
      },
      {
        updated: "2019-01-01T10:00:00.000000Z",
      },
      {
        updated: "2019-02-01T12:00:00.000000Z",
      },
      {
        updated: "2020-01-01T12:00:00.000001Z",
      },
      {
        updated: "2020-01-01T12:00:00.000000Z",
      },
      {
        updated: null,
      },
    ];
    expect(FindLastUpdated(input)).toStrictEqual(input[4].updated);
  });

  test("undefined", () => {
    const input: { updated?: string }[] = [
      {
        updated: undefined,
      },
      {
        updated: undefined,
      },
      {
        updated: undefined,
      },
      {
        updated: undefined,
      },
    ];
    expect(FindLastUpdated(input)).toBeUndefined();
    input[0].updated = "2020-01-01T12:00:00.000000Z";
    expect(FindLastUpdated(input)).toBe(input[0].updated);
  });

  test("data", () => {
    expect(
      FindLastUpdated({
        updated: "1",
      }),
    ).toBe("1");
  });

  test("nothing", () => {
    const input: any[] = [];
    expect(FindLastUpdated(input)).toBeUndefined();
  });
});
