import { Animate, Animation } from "./Animate";

describe("Animate", () => {
  test("class", () => {
    expect(Animate.class(Animation.Fade)).toEqual("animationFadeAdd");
  });
});
