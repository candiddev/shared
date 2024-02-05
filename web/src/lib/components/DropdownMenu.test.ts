import { AppState } from "../states/App";
import type { DropdownMenuAttrs } from "./DropdownMenu";
import { DropdownMenu } from "./DropdownMenu";

let bool = false;

const dropdown: DropdownMenuAttrs = {
  class: "custom-class",
  id: "test",
  items: [
    {
      icon: "click",
      name: "Link",
      onclick: (): void => {
        bool = true;
      },
      permitted: true,
      requireOnline: true,
    },
    {
      header: true,
      name: "Header",
      permitted: true,
      requireOnline: true,
    },
    {
      href: "/anewlink",
      permitted: false,
      requireOnline: false,
    },
  ],
};

describe("DropdownMenu", () => {
  AppState.setComponentsDropdownMenu("test", 0);
  testing.mount(DropdownMenu, dropdown);

  test("items", async () => {
    testing.findAll("#dropdown-test > li", 2);

    testing.text(".DropdownMenu__item--header", "Header");

    AppState.setComponentsDropdownMenu("", 0);

    testing.redraw();
    await testing.sleep(100);

    testing.notFind("#dropdown-test");
    AppState.setComponentsDropdownMenu("test", 0);
    testing.redraw();
  });

  test("onclick", () => {
    testing.click("#dropdown-item-link");
    expect(bool).toBeTruthy();
    AppState.setComponentsDropdownMenu("test", 0);
    testing.redraw();
  });

  test("offline", async () => {
    AppState.data.sessionOnline = false;
    dropdown.items![2].permitted = true;
    testing.redraw();
    testing.findAll("#dropdown-test > li", 1);
    testing.findAll("#dropdown-test > li > a", 1);
  });
});
