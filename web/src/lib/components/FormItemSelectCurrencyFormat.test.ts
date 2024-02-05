import { CurrencyEnum } from "@lib/types/Currency";

import type { FormItemSelectCurrencyFormatAttrs } from "./FormItemSelectCurrencyFormat";
import { FormItemSelectCurrencyFormat } from "./FormItemSelectCurrencyFormat";

test("FormItemSelectCurrencyFormat", async () => {
  let format = CurrencyEnum.USD;
  testing.mount(FormItemSelectCurrencyFormat, {
    oninput: (e) => {
      format = e;
    },
    permitted: true,
    value: format,
  } as FormItemSelectCurrencyFormatAttrs);

  const currencyFormat = testing.find("#form-item-select-currency-format");
  testing.input(currencyFormat, "2");
  testing.value(currencyFormat, "2");
  expect(format).toBe(2);
});
