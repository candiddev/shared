import m from "mithril";
import Stream from "mithril/stream";

import { AppState } from "../states/App";
import type { FilterType } from "../types/Filter";
import { Icons } from "../types/Icons";
import type { TableAttrs } from "./Table";
import { Table } from "./Table";
import { TableDataType } from "./TableData";
import type { TableHeaderSortAttrs } from "./TableHeader";

test("Table", async () => {
	const attrs: TableAttrs = {
		actions: [
			{
				name: "test",
				onclick: async (): Promise<void> => {
					return new Promise(() => {});
				},
				permitted: true,
				requireOnline: true,
			},
		],
		class: "some-class",
		data: [
			{
				count: 1,
				id: "a",
				value: "red",
			},
			{
				count: 2,
				id: "b",
				value: "orange",
			},
			{
				count: 3,
				id: "c",
				value: "yellow",
			},
		],
		editOnclick: (): void => {},
		filters: [
			{
				name: "test",
				value: [
					"a",
					"b",
				],
			},
		],
		loaded: true,
		sort: Stream<TableHeaderSortAttrs>({
			invert: false,
			property: "count",
		}),
		tableColumns: [
			{
				linkFormatter: (data: {count: number, value: string,}): string => {
					return `/test/${data.value}?count=${data.count}`;
				},
				name: "Item",
				property: "value",
				type: TableDataType.Link,
			},
			{
				name: "Count",
				property: "count",
			},
			{
				name: "ID",
				noToggle: true,
				property: "name",
				render: (): m.Component<{
					id: string,
				}> => {
					return {
						view: (vnode): m.Children => {
							return m("p", vnode.attrs.id);
						},
					};
				},
			},
			{
				name: "Something",
				property: "something",
			},
		],
		tableColumnsNameEnabled: Stream<FilterType>({
			count: "",
			value: "",
			name: "", // eslint-disable-line sort-keys
		}),
	};
	testing.mount(Table, attrs);

	const columns = testing.findAll("#button-array-show-columns > p", 3);
	testing.hasClass(columns[1], "ButtonArray__selected");
	testing.text(columns[2], "Something");
	testing.notHasClass(columns[2], "ButtonArray__selected");
	testing.hasClass(".Table__container", "some-class");

	testing.find("#table-header");
	testing.find("#table");
	for (let i = 0; i < attrs.data.length; i++) {
		const item = attrs.data[i];
		const row = testing.find(`#table-row_${item.id}`);
		const data = testing.find(`#${row.id} a`);
		testing.hasAttribute(data, "href", `#!/test/${item.value}?count=${item.count}`);
		testing.text(data, `${item.value}`);
		testing.text(testing.findAll(`#${row.id} p`)[1], item.id);
	}

	testing.find("#button-test");

	testing.notFind("#table-header-something");
	attrs.tableColumnsNameEnabled({
		...attrs.tableColumnsNameEnabled(),
		...{
			something: "",
		},
	});
	testing.redraw();
	testing.find("#table-header-something");

	// Test sort
	testing.text("#table-data-a-count", "1");
	testing.click("#table-header-count");
	expect(attrs.sort!().invert)
		.toBeTruthy();
	testing.text("#table-data-c-count", "3");

	// Test state restore
	document.getElementById("tablediv")!.scrollTop = 1000;
	testing.mount("div");
	attrs.tableColumnsNameEnabled({});
	attrs.sort!({
		...attrs.sort!(),
		invert: false,
	});
	testing.mount(Table, attrs);
	await testing.sleep(100);
	expect(document.getElementById("tablediv")!.scrollTop)
		.toBe(1000);
	expect(attrs.sort!().invert)
		.toBeTruthy();
	expect(Object.keys(attrs.tableColumnsNameEnabled()))
		.toHaveLength(4);

	attrs.data = [];
	AppState.data.layoutAppToolbarActionButtons = [
		{
			icon: Icons.Delete,
			name: "Data",
			permitted: true,
			requireOnline: true,
		},
		{
			icon: Icons.Delete,
			name: "Something",
			permitted: true,
			requireOnline: true,
		},
	];
	testing.redraw();
	testing.text("#table-no-data-message", "Nothing Found");
	const buttons = testing.findAll("Button", 3);
	testing.text(buttons[1], "addNew Data");

	attrs.loaded = false;
	testing.redraw();

	testing.notFind("#table-no-data-message");
	testing.findAll(".Table__loading", 5);
});
