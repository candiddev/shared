import m from "mithril";

import { AppHeader } from "./AppHeader";

function logo(): m.Component {
  return {
    view: (): m.Children => {
      return m("div#logo");
    },
  };
}

test("AppHeader", async () => {
  testing.mount(AppHeader, {
    logo: logo,
  });

  testing.find("#app-header #app-logo");
  testing.find("#app-logo .AppLogo__toggles #logo");
});
