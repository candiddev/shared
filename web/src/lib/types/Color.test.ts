import { Color, ColorEnum } from "./Color";

describe("Color", () => {
  test("contentColor", () => {
    expect(Color.contentColor(ColorEnum.blue.light)).toBe(Color.content.white);

    expect(Color.contentColor(ColorEnum.orange.dark)).toBe(Color.content.black);
    expect(Color.contentColor(ColorEnum.blue.dark)).toBe(Color.content.black);
  });

  test("toHex", () => {
    expect(Color.toHex("#000000")).toBe("#000000");
    expect(Color.toHex("blue", true)).toBe(ColorEnum.blue.dark);
  });
});
