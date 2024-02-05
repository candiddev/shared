import { SetClass } from "./SetClass";

test("SetClass", () => {
  expect(
    SetClass({
      a: false,
      b: true,
      c: true,
      d: false,
    }),
  ).toBe("b c");
});
