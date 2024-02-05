import { Clone } from "../utilities/Clone";
import { Position } from "./Position";

describe("Position", () => {
  const dataPosition = [
    {
      id: "1",
      position: "0:a",
    },
    {
      id: "2",
      position: "1:a",
    },
    {
      id: "3",
      position: "1:ab",
    },
    {
      id: "4",
      position: "1:aa",
    },
  ];

  test.each([
    ["increment", dataPosition[0], false, "1:aaa"],
    ["before", dataPosition[1], true, "1:aaa"],
    ["after", dataPosition[3], false, "1:aba"],
    ["next", dataPosition[1], false, "2"],
  ])("findPositionAdjacent: %s", (_name, input, before, output) => {
    expect(Position.adjacent(input, dataPosition, before)).toBe(output);
  });

  test.each([
    ["Same number", "1:aaaa", "1:aaa", "1:aaab"],
    ["Whole number", "2:a", "2", "2:b"],
    ["two digits", "1:ba", "1:c", "1:ca"],
    ["complex", "1:acc", "1:acda", "1:acdaa"],
    ["Different number", "2:a", "3:abbb", "3:abbba"],
  ])("between: %s", (_name, top, bottom, output) => {
    expect(Position.between(top, bottom)).toBe(output);
    const input = [
      {
        id: "1",
        position: top,
      },
      {
        id: "2",
        position: output,
      },
      {
        id: "3",
        position: bottom,
      },
    ];
    const inputSort = Clone(input);
    Position.sort(inputSort);
    expect(input).toStrictEqual(inputSort);
  });
  test("increase", () => {
    expect(Position.increase("0", true)).toBe("1");
    expect(Position.increase("5:aaaaaa", true)).toBe("6");
    expect(Position.increase("0", false)).toBe("0:a");
    expect(Position.increase("5:aaaaaa", false)).toBe("5:aaaaaaa");
  });

  test("sort", () => {
    const input = [
      {
        id: "1",
        position: "0:aaaba",
      },
      {
        id: "2",
        position: "0:aaabbc",
      },
      {
        id: "3",
        position: "0:aaabb",
      },
      {
        id: "4",
        position: "0:aaab",
      },
      {
        id: "5",
        position: "0:aaaz",
      },
      {
        id: "6",
        position: "0",
      },
      {
        id: "7",
        position: "1:z",
      },
      {
        id: "8",
        position: "1",
      },
    ];
    const output = [...input];
    Position.sort(output);
    expect(output).toStrictEqual(input);
  });
});
