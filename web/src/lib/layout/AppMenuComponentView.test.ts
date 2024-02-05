import { AppState } from "@lib/states/App";
import { DisplayEnum } from "@lib/types/Display";
import Stream from "mithril/stream";

import type {
  AppMenuComponentViewAttrs,
  AppMenuComponentViewItem,
} from "./AppMenuComponentView";
import { AppMenuComponentView } from "./AppMenuComponentView";

test("AppMenuComponentView", async () => {
  const attrs: AppMenuComponentViewAttrs = {
    cLower: "test",
    items: Stream([
      {
        id: "1",
        link: "/test1",
        name: "test1",
      },
      {
        icon: "b",
        id: "2",
        name: "test2",
      },
    ] as AppMenuComponentViewItem[]),
    query: "?id",
    vLower: "thing",
    vroute: "/test/thing",
  };
  testing.mount(AppMenuComponentView, attrs);

  // Open/Close
  const viewMenu = testing.find("ul");
  testing.notHasClass(viewMenu, "AppMenu__menu--open");
  AppState.setLayoutAppMenuPath("/test");
  testing.redraw();
  testing.hasClass(viewMenu, "AppMenu__menu--open");

  // Item links
  const links = testing.findAll("a");
  testing.hasAttribute(links[0], "href", "#!/test1");
  testing.hasAttribute(links[1], "href", "#!/test/thing?id=2");
  attrs.itemsUseID = true;
  testing.redraw();
  testing.hasAttribute(links[1], "href", "#!/test/thing/2");

  // Item props
  const items = testing.findAll("li");
  testing.notHasClass(items[0], "AppMenu__entry--active");
  testing.mocks.route = "/test1";
  testing.redraw();
  testing.hasClass(items[0], "AppMenu__entry--active");
  AppState.data.sessionDisplay = DisplayEnum.Large;
  AppState.toggleLayoutAppMenuOpen(true);
  testing.click("#app-menu-item-thing-test1");
  expect(AppState.isLayoutAppMenuOpen()).toBeFalsy();

  // Icons
  testing.text(items[0], "tagtest1");
  testing.text(items[1], "btest2");
  attrs.itemsIcon = "c";
  testing.redraw();
  testing.text(items[0], "ctest1");
  testing.text(items[1], "ctest2");
  attrs.itemsIconFormatter = () => {
    return "d";
  };
  testing.redraw();
  testing.text(items[0], "dtest1");
  testing.text(items[1], "dtest2");

  // Counts
  attrs.countFormatter = () => {
    return "5";
  };
  testing.redraw();
  testing.text(items[0], "dtest15");
  const count = testing.find("li:first-of-type span:nth-of-type(2)");
  testing.hasClass(count, "GlobalCount");
  attrs.colorFormatter = () => {
    return "var(--color_green)";
  };
  testing.redraw();
  testing.notHasClass(count, "GlobalCount");
  testing.hasStyle(count, "color: var(--color_green");
  attrs.countFormatter = () => {
    return "0";
  };
  testing.redraw();
  testing.text(items[0], "dtest1");
});
