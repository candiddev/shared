import type { FormItemTextAreaAttrs } from "./FormItemTextArea";
import { FormItemTextArea } from "./FormItemTextArea";

describe("FormTextArea", () => {
  test("clickable/disabled with lookup", async () => {
    const input: FormItemTextAreaAttrs = {
      clickable: true,
      name: "test",
      oninput: (): void => {},
      placeholder: "Garbage",
      required: true,
      value: "This is a fun test\nThis test is fun",
    };
    testing.mount(FormItemTextArea, input);
    testing.click("#form-item-text-area-preview-test");
    await testing.sleep(100);
    const spans = testing.findAll("#form-item-text-area-test span");
    expect(spans.length).toBe(2);
    testing.text(spans[0], "This is a fun test");
    testing.click(spans[0]);
    testing.hasStyle(spans[0], "text-decoration: line-through");
    testing.find("#form-item-text-area-scan-test");
    input.noScan = true;
    testing.redraw();
    testing.notFind("#form-item-text-area-scan-test");
  });

  test("input", async () => {
    let value = "";
    const attrs = {
      clickable: false,
      disabled: false,
      name: "test",
      oninput: (e: string): void => {
        value = e;
      },
      placeholder: "Garbage",
      required: true,
      value: "",
    };
    testing.mount(FormItemTextArea, attrs);
    const textarea = testing.find("#form-item-text-area-test");
    testing.input(textarea, "Some kind of input");
    expect(value).toBe("Some kind of input");
    testing.hasAttribute(textarea, "placeholder", attrs.placeholder);
    testing.hasAttribute(textarea, "required", "");
  });
});
