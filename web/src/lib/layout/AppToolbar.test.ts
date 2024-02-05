import { DisplayEnum } from "@lib/types/Display";

import { AppState } from "../states/App";
import { AppToolbar } from "./AppToolbar";

test("AppToolbar", async () => {
  testing.mount(AppToolbar, {
    actions: () => {
      return [
        {
          name: "some action",
          permitted: true,
          requireOnline: false,
        },
      ];
    },
  });

  testing.text("#breadcrumbs", "home");

  AppState.data.layoutAppBreadCrumbs = [
    {
      link: "/a",
      name: "A",
    },
    {
      link: "/b",
      name: "B",
    },
  ];

  testing.redraw();

  testing.text("#breadcrumbs", "home > A > B");
  testing.hasAttribute("a", "href", "#!/signin");
  testing.hasAttribute("a:nth-of-type(2)", "href", "#!/a");

  testing.notFind("#toolbar-buttons");
  AppState.setSessionAuthenticated(true);
  testing.redraw();
  testing.find("#toolbar-buttons");
  testing.notFind("#button-keep-awake");
  AppState.data.sessionDisplay = DisplayEnum.Small;
  testing.redraw();
  testing.find("#button-keep-awake");
  testing.find("#button-help");
  testing.find("#app-toolbar-action-toggle");
});
