import { AppState } from "@lib/states/App";

import { AppMenuFooter } from "./AppMenuFooter";

test("AppMenuFooter", async () => {
	process.env.BUILD_VERSION = "test";
	AppState.product = "test";
	testing.mount(AppMenuFooter);
	testing.text("#app-menu-footer-version", "test test");
});
