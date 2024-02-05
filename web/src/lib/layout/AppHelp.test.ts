import { AppState } from "../states/App";
import { AppHelp } from "./AppHelp";

test("AppHelp", async () => {
  testing.mocks.route = "/test2";

  testing.mount(AppHelp);

  AppState.data.layoutAppHelpLink = "";
  testing.notFind("#form-help");
  AppState.toggleLayoutAppHelpOpen(true);
  testing.redraw();
  await testing.sleep(100);
  testing.find("#form-help");

  testing.hasAttribute("iframe", "src", "");

  testing.click("#button-close");
  expect(AppState.data.layoutAppHelpOpen).toBe(false);
});
