import { MaterialIcons } from "../types/MaterialIcons";
import type { FormItemInputIconAttrs } from "./FormItemInputIcon";
import { FormItemInputIcon } from "./FormItemInputIcon";

test("FormItemInputIcon", async () => {
  let value = "";
  const attrs: FormItemInputIconAttrs = {
    oninput: (e): void => {
      value = e;
    },
    value: value,
  };
  testing.mount(FormItemInputIcon, attrs);
  testing.findAll("option", MaterialIcons.length);
  const input = testing.find("#form-item-input-icon");
  testing.input(input, "test");
  expect(value).toBe("test");
  testing.text(".Tooltips__text", "tooltip Google Fonts");
});
