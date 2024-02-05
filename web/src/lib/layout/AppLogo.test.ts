import type { DropdownMenuAttrsItem } from "@lib/components/DropdownMenu";
import m from "mithril";

import type { AppLogoAttrs } from "./AppLogo";
import { AppLogo } from "./AppLogo";

function logo(): m.Component {
  return {
    view: (): m.Children => {
      return m("div#logo");
    },
  };
}

test("AppLogo", async () => {
  let search = "";
  const attrs: AppLogoAttrs = {
    logo: logo,
    searcher: (_search): DropdownMenuAttrsItem[] => {
      search = _search;

      return [
        {
          href: "/store1",
          icon: "store",
          name: "Store1",
          permitted: true,
          requireOnline: false,
        },
        {
          href: "/store2",
          icon: "store",
          name: "Store2",
          permitted: true,
          requireOnline: false,
        },
      ];
    },
  };
  testing.mount(AppLogo, attrs);
  testing.notFind("#dropdown-app-menu-search");
  const searchbox = testing.find("#form-item-input-app");
  searchbox.dispatchEvent(new Event("focus"));
  testing.input(searchbox, "Store");
  await testing.sleep(600);
  testing.find("#dropdown-app-search");
  testing.findAll("li", 2);
  testing.hasAttribute("a", "href", "#!/store1");
  testing.click("a");
  searchbox.dispatchEvent(new Event("focusout"));
  testing.mocks.requests = [];
  await testing.sleep(100);
  testing.notFind("#dropdown-app-search");
  searchbox.dispatchEvent(new Event("focus"));
  await testing.sleep(100);
  testing.find("#dropdown-app-search");
  testing.findAll("li", 1);
  testing.text("li", "storeStore1");
  expect(search).toBe("Store");
  testing.find("#logo");
});
