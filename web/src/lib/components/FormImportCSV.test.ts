import type { FormImportCSVAttrs } from "./FormImportCSV";
import { FormImportCSV } from "./FormImportCSV";

test("FormImportCSV", async () => {
  let visible = true;

  const input: FormImportCSVAttrs = {
    buttons: [
      {
        name: "Test",
        onclick: async () => {},
        permitted: true,
        requireOnline: true,
      },
    ],
    fields: {},
    oninput: () => {},
    onsubmit: async () => {},
    title: "",
    toggle: (v) => {
      visible = v;
    },
    visible: visible,
  };

  testing.mount(FormImportCSV, input);
  const toggle = testing.find("#button-cancel");
  testing.click(toggle);
  expect(visible).toBeFalsy;
  visible = true;

  testing.find("#button-test");
  testing.find("#button-select-csv");
  testing.notFind("#form-item-csv-field-mapping");
});
