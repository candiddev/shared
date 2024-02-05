import type { FormItemSelectAttrs } from "./FormItemSelect";
import { FormItemSelect } from "./FormItemSelect";

describe("FormItemSelect", () => {
  test("values", async () => {
    let value = "";
    const attrs: FormItemSelectAttrs = {
      multiple: true,
      name: "test",
      oninput: (e: string): void => {
        value = e;
      },
      options: [
        {
          color: "red",
          id: "1",
          name: "a",
        },
        "b",
        "c",
      ],
      required: true,
      value: value,
    };
    testing.mount(FormItemSelect, attrs);
    const select = testing.find("#form-item-select-test");
    testing.findAll("#form-item-select-test > option", 3);
    testing.value("#form-item-select-test > option", "1");
    testing.hasAttribute(select, "required", "");
    testing.input(select, "1");
    expect(value).toBe("1");
    testing.text("#form-item-select-none-test", "Deselect All");
    testing.click("#form-item-select-none-test");
    expect(value).toBe("");
  });
});
