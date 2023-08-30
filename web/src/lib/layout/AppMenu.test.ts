import type { DropdownMenuAttrsItem } from "@lib/components/DropdownMenu";
import { AppState } from "@lib/states/App";
import { DisplayEnum } from "@lib/types/Display";
import m from "mithril";
import Stream from "mithril/stream";

import type { AppMenuAttrs } from "./AppMenu";
import { AppMenu } from "./AppMenu";

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
			return m("p#contact-us", "contact us");
		},
	};
}

test("AppMenu", async () => {
	let init = false;
	let searchInput = "";

	const attrs: AppMenuAttrs = {
		components: [
			{
				countFormatter: () => {
					return 5;
				},
				icon: "test1",
				init: (): void => {
					init = true;
				},
				link: "test1",
				name: "test1",
				permitted: AppState.isSessionAuthenticated,
				requireOnline: true,
			},
			{
				icon: "settings",
				link: "Settings",
				name: "Settings",
				permitted: () => {
					return true;
				},
				requireOnline: false,
				views: Stream([
					{
						link: "test2",
						name: "test2",
					},
				]),
			},
		],
		contactUs: contactUs,
		logo: {
			logo: logo,
			searcher: (search): DropdownMenuAttrsItem[] => {
				searchInput = search;

				return [];
			},
		},
	};

	AppState.setSessionAuthenticated(true);
	AppState.toggleLayoutAppMenuOpen(false);
	testing.mount(AppMenu, attrs);

	// Open/close
	const menu = testing.find("#app-menu");
	testing.notHasClass(menu, "AppMenu--open");
	testing.notFind("#app-menu-container");
	AppState.toggleLayoutAppMenuOpen(true);
	testing.redraw();
	testing.hasClass(menu, "AppMenu--open");
	testing.find("#app-menu-container");

	// Search
	testing.input("#form-item-input-app", "test");
	await testing.sleep(500);
	expect(searchInput)
		.toBe("test");

	// Components
	testing.findAll("a", 2);
	let components = testing.findAll("li", 3);
	testing.hasClass(components[0], "AppMenu__entry--break");
	AppState.data.sessionOnline = false;
	testing.redraw();
	testing.findAll("a", 1);
	testing.findAll("li", 3);
	AppState.data.sessionOnline = true;
	AppState.setSessionAuthenticated(false);
	testing.redraw();
	testing.findAll("li", 3);
	AppState.setSessionAuthenticated(true);
	testing.redraw();
	testing.findAll("li", 3);

	// Component props
	testing.text(testing.findAll("a")[0], "test1test15");
	testing.text(components[1], "settingsSettingsexpand_less");
	testing.notHasClass(testing.findAll("a")[0], "AppMenu__entry--active");
	AppState.setLayoutAppMenuPath("/test1");
	testing.redraw();
	components = testing.findAll("a", 2);
	components = testing.findAll("li", 3);
	testing.hasClass(testing.findAll("a")[0], "AppMenu__entry--active");
	expect(init)
		.toBeTruthy();

	// Component onclick
	attrs.components[1].onclick = async (): Promise<void> => {
		return new Promise((resolve) => {
			init = false;

			return resolve();
		});
	};
	testing.redraw();
	testing.click(testing.findAll("li")[1]);
	expect(init)
		.toBeFalsy();
	attrs.components[0].onclick = undefined;
	attrs.components[0].link = "test5";
	testing.redraw();
	AppState.data.sessionDisplay = DisplayEnum.Large;
	AppState.setLayoutAppMenuPath("/test2");
	testing.click(testing.findAll("a")[0]);
	expect(AppState.getLayoutAppMenuPath())
		.toBe("/test5");
	expect(testing.mocks.route)
		.toBe("/test5");
	expect(AppState.isLayoutAppMenuOpen())
		.toBeFalsy();

	AppState.product = "test";
	AppState.toggleLayoutAppMenuOpen(true);
	process.env.BUILD_VERSION = "1.0";
	testing.redraw();
	testing.find("#contact-us");
	testing.text("#app-menu-footer-version", "test 1.0");
});
