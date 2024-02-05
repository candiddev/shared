import type { IconRowAttrs } from "./IconRow";
import { IconRow } from "./IconRow";

test("IconRow", async () => {
  let visible = true;

  const attrs = {
    icons: [
      {
        icon: "add",
        onclick: (): void => {
          visible = false;
        },
      },
      {
        icon: "shopping_cart",
        onclick: (): void => {},
        visible: visible,
      },
    ],
  } as IconRowAttrs;

  testing.mount(IconRow, attrs);

  const rows = testing.findAll(".IconRow > div", 2);

  testing.click(rows[0]);

  expect(visible).toBeFalsy();
});
