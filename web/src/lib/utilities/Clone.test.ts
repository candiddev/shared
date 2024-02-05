import { Clone } from "./Clone";

test("Clone", () => {
  const input = {
    array: [1, "2", false],
    bool: true,
    int: 1,
    object: {
      key: "value",
    },
    string: "String",
  };
  expect(Clone(input)).toStrictEqual(input);
});
