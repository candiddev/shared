import { FormItemIcons } from "./FormItemIcons";

test("FormItemIcons", () => {
  let number = 3;
  const state = {
    disabled: false,
    iconSelect: "a",
    iconUnselect: "b",
    max: 5,
    name: "Icons",
    onclick: (e: number): void => {
      number = e;
    },
    tooltip: "test",
    value: number,
  };

  testing.mount(FormItemIcons, state);

  testing.find("#form-item-label-icons");

  const icons = testing.find("#form-item-icons-icons");
  testing.text(icons, "aaabb");
  testing.click(icons.getElementsByTagName("i")[1]); // eslint-disable-line no-restricted-syntax
  expect(number).toBe(2);
  testing.text("#form-item-input-none-icons", "Deselect All");
  testing.click("#form-item-input-none-icons");
  expect(number).toBe(0);
  number = 3;
  state.disabled = true;
  testing.redraw();
  testing.text(icons, "aaa");
});
