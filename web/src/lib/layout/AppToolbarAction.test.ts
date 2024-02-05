import { AppState } from "@lib/states/App";

import { AppToolbarAction } from "./AppToolbarAction";

test("AppToolbarAction", async () => {
  const attrs = {
    action: {
      name: "some action",
      permitted: true,
      requireOnline: false,
    },
  };

  AppState.data.layoutAppToolbarActionButtons = [
    {
      name: "this page action",
      permitted: true,
      requireOnline: false,
    },
  ];
  testing.mount(AppToolbarAction, attrs);
  const button = testing.find("#app-toolbar-action-toggle");
  testing.click(button);
  const items = testing.findAll("#dropdown-app-toolbar-action li", 3);
  testing.text(items[0], "On this page");
  testing.text(items[1], "this page action");
  testing.text(items[2], "some action");
});
