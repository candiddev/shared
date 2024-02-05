import { FormCheckbox } from "./FormCheckbox";

test("FormCheckbox", async () => {
  let checked = false;
  const input = {
    name: "Checkbox",
    onclick: (): void => {
      checked = !checked;
    },
    topPadding: true,
    value: checked,
  };

  testing.mount(FormCheckbox, input);

  const label = testing.find("#form-checkbox-label-checkbox");
  expect(checked).not.toBeTruthy();
  testing.text(label, input.name);
  testing.hasAttribute(label, "for", "form-checkbox-input-checkbox");
  testing.click("#form-checkbox-input-checkbox");
  expect(checked).toBe(true);
});
