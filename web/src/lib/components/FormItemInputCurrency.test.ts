import { CurrencyEnum } from "@lib/types/Currency";

import type { FormItemInputCurrencyAttrs } from "./FormItemInputCurrency";
import { FormItemInputCurrency } from "./FormItemInputCurrency";

test("FormItemInputCurrency", async () => {
  const state = {
    value: 100,
  };

  const attrs: FormItemInputCurrencyAttrs = {
    format: CurrencyEnum.USD,
    name: "test",
    oninput: (amount: number) => {
      state.value = amount;
    },
    required: true,
    tooltip: "test",
    value: state.value,
  };

  testing.mount(FormItemInputCurrency, attrs);

  const currency = testing.find("#form-item-input-test");
  testing.hasAttribute(currency, "required", "");
  testing.value(currency, " $1.00");
  testing.input(currency, "$5.00");
  testing.value(currency, "$5.00");
  expect(state.value).toBe(500);
  testing.input(currency, "-$5.00");
  testing.value(currency, "-$5.00");
  expect(state.value).toBe(-500);

  attrs.onlyPositive = true;
  testing.input(currency, "-$9.00");
  expect(state.value).toBe(900);
});
