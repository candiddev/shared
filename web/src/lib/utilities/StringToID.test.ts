import { StringToID } from "./StringToID";

test("StringToID", () => {
  expect(StringToID("Some Long String!!")).toBe("-some-long-string");
  expect(StringToID("SomeLong String!!")).toBe("-somelong-string");
  expect(StringToID("#### A header")).toBe("-a-header");
  expect(StringToID("#### A header", true)).toBe("a-header");
});
