import type { FormItemDurationAttrs } from "./FormItemDuration";
import { FormItemDuration } from "./FormItemDuration";

test("FormItemDuration", async () => {
  let duration = 90;
  const input: FormItemDurationAttrs = {
    getDuration: (): number => {
      return duration;
    },
    name: "Duration",
    setDuration: (d: number): void => {
      duration = d;
    },
    tooltip: "A tooltip",
  };
  testing.mount(FormItemDuration, input);
  testing.find("#form-item-label-duration");
  const multi = testing.find("#form-item-multi-duration");
  testing.value(multi.getElementsByTagName("input")[0], "1"); // eslint-disable-line no-restricted-syntax
  testing.value(multi.getElementsByTagName("input")[1], "30"); // eslint-disable-line no-restricted-syntax
  testing.input(multi.getElementsByTagName("input")[0], "2"); // eslint-disable-line no-restricted-syntax
  expect(duration).toBe(150);
  testing.input(multi.getElementsByTagName("input")[1], "60"); // eslint-disable-line no-restricted-syntax
  expect(duration).toBe(180);
});
