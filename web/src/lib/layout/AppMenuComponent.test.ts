import { AppState } from "@lib/states/App";
import Stream from "mithril/stream";

import type { AppMenuComponentAttrs, AppMenuComponentView } from "./AppMenuComponent";
import { AppMenuComponent } from "./AppMenuComponent";
import type { AppMenuNestedData } from "./AppMenuNested";

test("AppMenuComponent", async () => {
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

	let collapsed: NullUUID = null;

	const attrs: AppMenuComponentAttrs = {
		cLower: "test",
		views: Stream([
			{
				icon: "a",
				link: "/test1",
				name: "test1",
			},
			{
				items: Stream([
					{
						name: "a",
					},
				]),
				link: "/test2",
				name: "test2",
				requireOnline: true,
			},
			{
				itemsRequireOnline: true,
				link: "/test3",
				name: "test3",
				nested: {
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
				},
			},
		] as AppMenuComponentView[]),
	};
	testing.mount(AppMenuComponent, attrs);

	// Open/close
	const menu = testing.find("#app-menu-test");
	testing.notHasClass(menu, "AppMenu__menu--open");
	AppState.setLayoutAppMenuPath("/test");
	testing.redraw();
	testing.hasClass(menu, "AppMenu__menu--open");

	// Views
	const views = testing.findAll("li", 5);
	AppState.data.sessionOnline = false;
	testing.redraw();
	testing.findAll("li", 2);
	AppState.data.sessionOnline = true;

	// View classes
	testing.notHasClass(views[0], "AppMenu__entry--active");
	testing.mocks.route = "/test/test1/test";
	testing.redraw();
	testing.hasClass(views[0], "AppMenu__entry--active");
	attrs.views()[0]!.matchExact = true;
	testing.redraw();
	testing.notHasClass(views[0], "AppMenu__entry--active");
	testing.hasClass(views[1], "AppMenu__entry--disabled");
	testing.hasClass(views[1], "AppMenu__entry--header");

	// Links
	let links = testing.findAll("a");
	testing.hasAttribute(links[0], "href", "#!/test/test1");
	attrs.views()[0]!.link = "/test2";
	testing.redraw();
	testing.hasAttribute(links[0], "href", "#!/test/test2");
	attrs.views()[0]!.linkOnly = true;
	testing.redraw();
	testing.hasAttribute(links[0], "href", "#!/test2");
	attrs.views()[0]!.link = "example.com";
	testing.redraw();
	testing.hasAttribute(links[0], "href", "#!example.com");
	testing.hasAttribute(links[0], "target", "_blank");

	// Link text
	testing.text(links[0], "atest1");
	testing.text(testing.findAll("p")[0], "test2");
	attrs.views()[1]!.icon = "a";
	testing.redraw();
	links = testing.findAll("a");
	testing.text(links[1], "test2a");
	attrs.views()[1]!.countFormatter = () => {
		return 5;
	};
	testing.redraw();
	testing.text(links[1], "test25a");
	testing.hasAttribute(links[1].getElementsByTagName("a")[0], "href", "#!/test/test2"); // eslint-disable-line no-restricted-syntax

	// Toggle menu
	testing.findAll("ul", 2);
	testing.text("#app-menu-nested-1-link", "icon1a3");
	AppState.data.sessionOnline = false;
	testing.redraw();
	testing.notFind("#render");
	testing.findAll("ul", 1);
});
