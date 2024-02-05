import type { FormItemInputAttrs } from "./FormItemInput";
import { FormItemInput } from "./FormItemInput";

describe("FormItemInput", () => {
  test("input", async () => {
    const attrs: FormItemInputAttrs = {
      autocomplete: "yes",
      bold: true,
      datalist: ["mylist"],
      disabled: false,
      hidden: false,
      markdown: true,
      monospace: true,
      name: "test",
      oninput: (e: string): void => {
        attrs.value = e;
      },
      placeholder: "Garbage",
      required: true,
      type: "text",
      value: "",
    };
    testing.mount(FormItemInput, attrs);

    const text = testing.find("#form-item-input-test");
    testing.input(text, "testing!");
    testing.hasAttribute(text, "autocomplete", "yes");
    testing.hasAttribute(text, "list", "form-item-datalist-test");
    testing.hasAttribute(text, "placeholder", attrs.placeholder as string);
    testing.hasAttribute(text, "required", "");
    testing.hasAttribute(text, "type", "text");
    testing.hasStyle(text, "font-family: monospace");
    testing.hasStyle(text, "font-weight: var(--font-weight_bold)");
    expect(attrs.value).toBe("testing!");
    testing.input(text, "example.com");
    attrs.disabled = true;
    await testing.sleep(200);
    const a = document.getElementsByTagName("a")[0]; // eslint-disable-line no-restricted-syntax
    testing.text(a, "example.com");
    testing.hasAttribute(a, "href", "http://example.com");

    attrs.disabled = undefined;
    attrs.oninput = undefined;
    attrs.onlyDatalist = true;
    attrs.value = [];

    testing.input(text, "test");
    expect(attrs.value).toStrictEqual([]);

    testing.input(text, "mylist");
    expect(attrs.value).toStrictEqual(["mylist"]);
  });

  test("range", async () => {
    let value = 0;

    const attrs: FormItemInputAttrs = {
      max: 10,
      min: 1,
      name: "range",
      oninput: (n: string) => {
        value = parseInt(n, 10);
      },
      type: "range",
      value: value,
    };

    testing.mount(FormItemInput, attrs);

    const input = testing.find("#form-item-input-range");
    testing.hasAttribute(input, "max", "10");
    testing.hasAttribute(input, "min", "1");
    testing.hasAttribute(input, "type", "number");
    testing.input(input, "5");
    expect(value).toBe(5);

    const range = testing.find("#form-item-input-range-range");
    testing.hasAttribute(range, "max", "10");
    testing.hasAttribute(range, "min", "1");
    testing.hasAttribute(range, "type", "range");
    testing.input(range, "8");
    expect(value).toBe(8);
  });

  test("array", async () => {
    const attrs: FormItemInputAttrs = {
      name: "tags",
      type: "text",
      value: ["a", "b", "c"],
      valueLinkPrefix: "/?test=",
    };
    testing.mount(FormItemInput, attrs);
    const array = testing.find("#button-array-tags");
    testing.findAll(`#${array.id} p`, 3);
    testing.input("#form-item-input-tags", "d ");
    testing.redraw();
    testing.value("#form-item-input-tags", "");
    testing.findAll(`#${array.id} p`, 4);
    testing.click(`#${array.id} p`);
    expect(attrs.value).toStrictEqual(["b", "c", "d"]);
    attrs.disabled = true;
    testing.redraw();
    testing.click(`#${array.id} a`);
    expect(testing.mocks.route).toBe("/?test=b");
  });
});
