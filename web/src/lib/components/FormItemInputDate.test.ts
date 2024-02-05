import type { FormItemInputDateAttrs } from "./FormItemInputDate";
import { FormItemInputDate } from "./FormItemInputDate";

test("FormItemInputDate", async () => {
  let date = "2023-05-10";

  const attrs: FormItemInputDateAttrs = {
    name: "test",
    oninput: (d: string) => {
      date = d;
    },
    required: true,
    tooltip: "test",
    value: date,
  };

  testing.mount(FormItemInputDate, attrs);

  const d = testing.find("#form-item-input-test");
  testing.hasAttribute(d, "required", "");
  testing.input(d, "2023-05-11");
  testing.value(d, "2023-05-11");
  expect(date).toBe("2023-05-11");
});
