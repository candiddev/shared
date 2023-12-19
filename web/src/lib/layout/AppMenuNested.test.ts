import { AppState } from "@lib/states/App";
import { Color } from "@lib/types/Color";
import { DisplayEnum } from "@lib/types/Display";
import Stream from "mithril/stream";

import type { AppMenuNestedAttrs, AppMenuNestedData } from "./AppMenuNested";
import { AppMenuNested } from "./AppMenuNested";

test("AppMenuNotes", async () => {
	const data = Stream([
		{
			children: [
				{
					id: "2",
					name: "b",
				},
			],
			color: "black",
			icon: "icon1",
			id: "1",
			name: "a",
		},
	] as AppMenuNestedData[]);

	AppState.setLayoutAppMenuPath("/data/1");
	testing.mocks.route = "/data/1";

	let collapsed: NullUUID = null;

	const attrs: AppMenuNestedAttrs = {
		data: data,
		findCount: () => {
			return 3;
		},
		href: (data: AppMenuNestedData) => {
			return `/data/${data.id}`;
		},
		icon: "icon2",
		isCollapsed: (id: NullUUID) => {
			return collapsed === id;
		},
		onclickCollapse: async (id: NullUUID) => {
			collapsed = id;
		},
		pathPrefix: "/data",
	};

	testing.mount(AppMenuNested, attrs);

	// Test entry
	const entry = testing.find(".AppMenu__entry");
	testing.hasClass(entry, "AppMenu__entry--active");
	testing.text(entry, "icon1a3expand_less");
	testing.hasClass(".GlobalButtonIconExpand", "GlobalButtonIconExpand--active");
	testing.mocks.route = "/data/2";
	testing.redraw();
	testing.notHasClass(".AppMenu__entry", "AppMenu__entry--active");

	// Menu
	const menu = testing.find(".AppMenu__menu");
	expect(menu.querySelectorAll(".AppMenu__entry"))
		.toHaveLength(1);
	testing.hasClass(menu, "AppMenu__menu--open");
	testing.click(".AppMenu__arrow");
	testing.redraw();
	testing.notHasClass(".GlobalButtonIconExpand", "GlobalButtonIconExpand--active");
	testing.notHasClass(menu, "AppMenu__menu--open");
	AppState.setLayoutAppMenuPath("/something");
	testing.redraw();
	testing.notFind(".AppMenu__menu");

	testing.hasStyle("i", `color: ${Color.toHex(data()[0].color!)}`);

	// Test link
	AppState.toggleLayoutAppMenuOpen(true);
	AppState.data.sessionDisplay = DisplayEnum.Large;
	const link = testing.find("#app-menu-nested-1-link");
	testing.hasAttribute(link, "href", "#!/data/1");
	testing.click(link);
	expect(AppState.isLayoutAppMenuOpen())
		.toBeFalsy();
});
