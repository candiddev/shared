import { Timestamp } from "../types/Timestamp";
import { FilterSortChildren } from "./FilterSortChildren";

const input = [
  {
    children: [],
    id: "0",
    parentID: null,
    position: "0",
  },
  {
    children: [],
    id: "1",
    parentID: null,
    position: "0:a",
  },
  {
    children: [],
    id: "2",
    parentID: "0",
    position: "3",
  },
  {
    children: [],
    id: "3",
    parentID: "0",
    position: "0:a",
  },
  {
    children: [],
    id: "4",
    parentID: "1",
    position: "0",
  },
  {
    children: [],
    id: "5",
    parentID: "1",
    position: "0:a",
  },
  {
    children: [],
    id: "6",
    parentID: "2",
    position: "6",
  },
  {
    children: [],
    id: "7",
    parentID: "2",
    position: "4",
  },
  {
    children: [],
    id: "8",
    parentID: "9",
    position: "0:aab",
  },
  {
    children: [],
    id: "9",
    parentID: "8",
    position: "0:aaa",
  },
  {
    children: [],
    id: "10",
    parentID: null,
    position: "1:b",
  },
  {
    children: [],
    id: "11",
    parentID: null,
    position: "1:c",
  },
  {
    children: [],
    id: "12",
    parentID: null,
    position: "1:ca",
  },
  {
    children: [],
    id: "13",
    parentID: null,
    position: "14:aaaaaab",
  },
  {
    children: [],
    id: "14",
    parentID: null,
    position: "14:aaabaa",
  },
  {
    children: [],
    id: "15",
    parentID: null,
    position: "14:aaaaa",
  },
  {
    children: [],
    id: "16",
    parentID: null,
    position: "14:aaaa",
  },
  {
    children: [],
    id: "17",
    parentID: null,
    position: "15",
  },
  {
    children: [],
    id: "18",
    parentID: null,
    position: "14",
  },
  {
    children: [],
    id: "19",
    parentID: null,
    position: "14:aaabaaa",
  },
  {
    children: [],
    id: "20",
    parentID: null,
    position: "14:aaaaaaaa",
  },
  {
    children: [],
    deleted: Timestamp.now().toString(),
    id: "21",
    parentID: null,
    position: "14:aaaaaaaa",
  },
];

describe("FilterSortChildren", () => {
  test("without rootID", () => {
    const output = [
      input[9],
      input[8],
      {
        ...input[1],
        ...{
          children: [input[5], input[4]],
        },
      },
      {
        ...input[0],
        ...{
          children: [
            input[3],
            {
              ...input[2],
              ...{
                children: [input[7], input[6]],
              },
            },
          ],
        },
      },
      input[10],
      input[12],
      input[11],
      input[20],
      input[13],
      input[15],
      input[16],
      input[19],
      input[14],
      input[18],
      input[17],
    ];
    expect(
      FilterSortChildren({
        input: input,
      }),
    ).toStrictEqual(output as any);
  });

  test("with rootID", () => {
    const output = [
      {
        ...input[0],
        ...{
          children: [
            input[3],
            {
              ...input[2],
              ...{
                children: [input[7], input[6]],
              },
            },
          ],
        },
      },
    ];
    expect(
      FilterSortChildren({
        input: input,
        rootID: input[0].id,
      }),
    ).toStrictEqual(output as any);
  });
});
