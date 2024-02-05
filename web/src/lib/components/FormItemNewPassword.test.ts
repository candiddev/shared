import type { FormItemNewPasswordAttrs } from "./FormItemNewPassword";
import { FormItemNewPassword } from "./FormItemNewPassword";

test("FormItemNewPassword", async () => {
  let password = "";

  const attrs: FormItemNewPasswordAttrs = {
    name: "Passphrase",
    oninput: (p: string): void => {
      password = p;
    },
    value: () => {
      return password;
    },
  };

  testing.mount(FormItemNewPassword, attrs);

  let el = testing.find("#form-item-input-new-passphrase") as HTMLInputElement;
  testing.input(el, "testing");
  testing.hasAttribute(el, "autocomplete", "new-password");
  testing.hasAttribute(el, "type", "password");
  testing.value(el, "testing");

  el = testing.find(
    "#form-item-input-confirm-new-passphrase",
  ) as HTMLInputElement;
  testing.input(el, "Testing");
  testing.hasAttribute(el, "autocomplete", "new-password");
  testing.hasAttribute(el, "type", "password");
  expect(el.reportValidity()).toBeFalsy();
  testing.input(el, "testing");
  expect(el.reportValidity()).toBeTruthy();
  expect(password).toBe("testing");

  testing.click("#form-checkbox-input-show-passphrase");
  testing.hasAttribute(el, "type", "text");

  attrs.noNew = true;
  testing.redraw();
  testing.find("#form-item-input-passphrase");

  attrs.noAutocomplete = true;
  testing.redraw();
  testing.hasAttribute("#form-item-input-passphrase", "autocomplete", "off");

  testing.find("#form-item-input-confirm-passphrase");
  attrs.noConfirm = true;
  testing.redraw();
  testing.notFind("#form-item-input-confirm-passphrase");
});
