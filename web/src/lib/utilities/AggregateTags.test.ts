import { AggregateTags } from "./AggregateTags";

test("AggregateTags", () => {
  const input = [
    {
      name: "1",
      tags: [],
    },
    {
      name: "2",
      tags: ["c", "b", "a"],
    },
    {
      name: "3",
      tags: ["e", "d", "c"],
    },
    {
      name: "4",
      tags: ["e", "c", "a"],
    },
    {
      deleted: "yes",
      name: "5",
      tags: ["e", "c", "a"],
    },
  ];
  const output: Tag[] = [
    {
      count: 2,
      name: "a",
    },
    {
      count: 1,
      name: "b",
    },
    {
      count: 3,
      name: "c",
    },
    {
      count: 1,
      name: "d",
    },
    {
      count: 2,
      name: "e",
    },
  ];
  expect(AggregateTags(input)).toStrictEqual(output);
  expect(AggregateTags([])).toStrictEqual([]);
});
