import { PushPopStringArray } from "./PushPopStringArray";

describe("PushPopStringArray", () => {
  test("push", () => {
    let array = ["a", "b"];

    array = PushPopStringArray("c", array);

    expect(array).toStrictEqual(["a", "b", "c"]);
  });

  test("pop", () => {
    let array = ["a", "b", "c"];

    array = PushPopStringArray("c", array);

    expect(array).toStrictEqual(["a", "b"]);
  });

  test("null", () => {
    let array = ["a", "b", "c"];

    array = PushPopStringArray(null, array);

    expect(array).toStrictEqual(["a", "b", "c"]);
  });
});
