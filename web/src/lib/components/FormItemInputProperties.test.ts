import type { FormItemInputPropertiesAttrs } from "./FormItemInputProperties";
import { FormItemInputProperties } from "./FormItemInputProperties";

test("FormItemInputProperties", async () => {
  const state = {
    button: "",
    data: {
      ignore: "yes",
      test: "test",
    } as {
      [key: string]: string;
    },
  };

  const attrs: FormItemInputPropertiesAttrs = {
    button: {
      icon: "test",
      onclick: (key) => {
        state.button = key;
      },
    },
    data: state.data,
    getKey: (key) => {
      return key;
    },
    getValue: (key) => {
      return state.data[key];
    },
    ignoreKeys: ["ignore"],
    keyOninput: (key, input) => {
      let d = {};

      for (const property of Object.keys(state.data)) {
        if (key === property) {
          d = {
            ...d,
            [input]: state.data[key],
          };
        } else {
          d = {
            ...d,
            [property]: state.data[property],
          };
        }
      }

      state.data = d as any;
    },
    name: "Keys",
    nameSingle: "Key",
    properties: ["a", "b", "c"],
    tooltip: "",
    valueMonospace: true,
    valueOninput: (key, input) => {
      state.data[key] = input;
    },
  };

  testing.mount(FormItemInputProperties, attrs);
  testing.findAll(".FormItem__multi", 1);

  const key1 = testing.find("#form-item-input-properties-key-1");
  testing.hasStyle(key1, "font-weight: var(--font-weight_bold)");
  testing.value(key1, "test");
  testing.input(key1, "test1");
  testing.value(key1, "test1");
  expect(state.data).toStrictEqual({
    ignore: "yes",
    test1: "test",
  });
  attrs.data = state.data;
  testing.redraw();
  testing.value(key1, "test1");

  const value1 = testing.find("#form-item-input-properties-value-1");
  testing.hasStyle(value1, "font-family: monospace");
  testing.value(value1, "test");
  testing.input(value1, "test1");
  testing.value(value1, "test1");
  expect(state.data).toStrictEqual({
    ignore: "yes",
    test1: "test1",
  });

  testing.click("#button-custom-1");
  expect(state.button).toBe("test1");
  testing.click("#button-delete-1");
  testing.findAll(".FormItem__multi", 0);
  testing.click("#button-add-key");
  testing.findAll(".FormItem__multi", 1);
});
