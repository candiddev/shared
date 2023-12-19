import type { DropdownMenuAttrsItem } from "@lib/components/DropdownMenu";
import m from "mithril";
import Stream from "mithril/stream";

import { AppState } from "../states/App";
import type { AppAttrs } from "./App";
import { App } from "./App";
import type { AppMenuComponent } from "./AppMenu";

function logo (): m.Component {
	return {
		view: (): m.Children => {
			return m("div#logo");
		},
	};
}

function contactUs (): m.Component {
	return {
		view: (): m.Children => {
			return m("div");
		},
	};
}

beforeEach(() => {
	AppState.setSessionAuthenticated(false);
});

describe("App", () => {
	let oncreate = false;

	AppState.oncreate = async (): Promise<void> => {
		return new Promise((resolve) => {
			oncreate = true;

			return resolve();
		});
	};

	testing.mocks.route = "/test";

	const attrs: AppAttrs = {
		contactUs: contactUs,
		hideHeader: false,
		logo: logo,
		menuComponents: Stream([
			{
				icon: "test",
				name: "Test",
				permitted: () => {
					return true;
				},
				requireOnline: true,
			},
		] as AppMenuComponent[]),
		public: false,
		searcher: (): DropdownMenuAttrsItem[] => {
			return [];
		},
		toolbarActions: () => {
			return {
				newTask: {
					name: "Task",
					permitted: true,
					requireOnline: false,
				},
			};
		},
	};

	test("oncreate", async () => {
		testing.mount(App, attrs);
		await testing.sleep(100);

		expect(oncreate)
			.toBeTruthy();
		expect(testing.mocks.route)
			.toBe("/signin");

		testing.mocks.route = "/test";
		attrs.public = true;
		expect(testing.mocks.route)
			.toBe("/test");

		attrs.public = false;
		AppState.setSessionAuthenticated(true);
		testing.redraw();
		expect(testing.mocks.route)
			.toBe("/test");
	});

	test("elements", async () => {
		testing.mount(App, attrs);
		await testing.sleep(100);

		const app = testing.find("#app");

		AppState.setComponentsDropdownMenu("test", 0);
		testing.click(app);
		expect(AppState.getComponentsDropdownMenu())
			.toBe("");

		testing.notFind("#app-header");
		testing.notFind("#app-menu");
		AppState.setSessionAuthenticated(true);
		attrs.hideHeader = true;
		testing.redraw();
		testing.notFind("#app-header");
		testing.notFind("#app-menu");
		attrs.hideHeader = false;
		testing.redraw();
		testing.find("#app-header");
		testing.find("#app-menu");

		const children = testing.find(".App__children");
		testing.notHasClass(children, "App__children--full");
		attrs.hideHeader = true;
		testing.redraw();
		testing.hasClass(children, "App__children--full");

		testing.notFind("#motd");
		AppState.motd = () => {
			return "Hello!";
		};
		testing.redraw();
		testing.notFind("#motd");
		attrs.hideHeader = false;
		testing.redraw();
		testing.find("#motd");
		testing.click("#button-dismiss");
		await testing.sleep(100);
		testing.notFind("#motd");
	});
});
