import "./TableHeader.css";

import type { Err } from "@lib/services/Log";
import { AppState } from "@lib/states/App";
import type { CurrencyEnum } from "@lib/types/Currency";
import m from "mithril";
import type Stream from "mithril/stream";

import type { FilterType } from "../types/Filter";
import { Icons } from "../types/Icons";
import { Animate, Animation } from "../utilities/Animate";
import { SetClass } from "../utilities/SetClass";
import { StringToID } from "../utilities/StringToID";
import type { ButtonArrayAttrs } from "./ButtonArray";
import { FormItem } from "./FormItem";
import { Icon } from "./Icon";
import { TableDataType } from "./TableData";

export interface TableLayoutAttrs {
	/** Input data for the Table, will be rendered into rows/columns. */
	data: any[], // eslint-disable-line @typescript-eslint/no-explicit-any

	/** ID for the table. */
	id?: string,

	/** Disable column filtering for the Table. */
	noFilters?: boolean,

	/** Sort attribute, allows sorting the Table. */
	sort?: Stream<TableHeaderSortAttrs>,

	/** A list of all available TableColumns. */
	tableColumns: TableColumnAttrs[],

	/** An object of enabled columns and their filters. */
	tableColumnsNameEnabled: Stream<FilterType>,
}

export interface TableColumnAttrs {
	checkboxOnclick?(object?: any): Promise<void | Err> | void, // eslint-disable-line @typescript-eslint/no-explicit-any

	/** A list of names that are collapsed by this column. */
	collapsedNames?: string[],

	/** The currency format to display with this column. */
	currencyFormat?: CurrencyEnum,

	/** A custom filter to show when attempting to filter this column. */
	customFilter?: ButtonArrayAttrs,

	/** The actual data for this column. */
	data?: any, // eslint-disable-line @typescript-eslint/no-explicit-any

	formatter?(object?: any): boolean | number | string, // eslint-disable-line @typescript-eslint/no-explicit-any
	iconFormatter?(object?: number | object | string): boolean | number | string,

	/** Custom ID for the TableData. */
	id?: string,

	/** Is the link external?  Will set target: _blank. */
	linkExternal?: boolean,
	linkFormatter?(object?: number | object | string): string,

	/** Does the link require it to be online? */
	linkRequireOnline?: boolean,

	/** Name to use for the header. */
	name: string,

	/** Disable filtering for this column. */
	noFilter?: boolean,

	/** Disable sorting for this column. */
	noSort?: boolean,

	/** Disable toggling this column. */
	noToggle?: boolean,

	/** Render column as a positive class. */
	positive?(object?: boolean | number | object | string): boolean,

	render?(): m.Component<any>, // eslint-disable-line @typescript-eslint/no-explicit-any

	/** A custom onclick function for the column. */
	onclick?(object: string): void,

	// Sets the drag function of a drag column type
	ondragend?(): Promise<void | Err>,

	/** Should this column be right aligned? */
	rightAlign?: boolean,

	permitted?(object?: any): boolean, // eslint-disable-line @typescript-eslint/no-explicit-any

	/** Property to display from data. */
	property: string,
	sortFormatter?(object?: number | object | string): boolean | number | string,

	/** The type of data to display/format. */
	type?: TableDataType,
	typeCheck?(object: object): TableDataType,
}

export interface TableHeaderSortAttrs {
	formatter?(object: any): boolean | number | string, // eslint-disable-line @typescript-eslint/no-explicit-any
	/** Is the sorting inverted? */
	invert: boolean,

	/** Property being sorted. */
	property: string,
}

export function TableHeader (): m.Component<TableLayoutAttrs> {
	const state = {
		filterName: "",
		filterProperty: "",
		timer: 0,
	};

	return {
		oncreate: (vnode): void => {
			const table = document.getElementById(`table${vnode.attrs.id === undefined ?
				"" :
				StringToID(vnode.attrs.id)}`);
			if (table !== null) {
				const tbody = table.getElementsByTagName("tbody")[0];
				const tr = tbody.children[0] as HTMLElement; // eslint-disable-line @typescript-eslint/consistent-type-assertions
				if (tr !== undefined && tr.offsetWidth !== tbody.offsetWidth) {
					vnode.dom.children[0].classList.add("TableHeader--padding");
				}
			}
		},
		view: (vnode): m.Children => {
			return m("thead", [
				m("tr", {
					id: `table-header${StringToID(vnode.attrs.id)}`,
				}, [
					vnode.attrs.tableColumns.map((column: TableColumnAttrs): m.Children => {
						return Object.keys(vnode.attrs.tableColumnsNameEnabled())
							.includes(column.property) ?
							m("th.TableHeader", {
								class: SetClass({
									"TableHeader--center": column.type === TableDataType.Checkbox || column.type === TableDataType.Drag || column.type === TableDataType.Image,
									"TableHeader--right": column.rightAlign === true || column.type === TableDataType.Currency,
								}),
								id: `table-header${StringToID(column.property)}`,
								onclick: () => {
									if (vnode.attrs.sort !== undefined) {
										const sort = vnode.attrs.sort();
										if (sort.property === column.property) {
											if (sort.invert) {
												sort.property = "";
												sort.invert = false;
											} else {
												sort.invert = true;
											}
										} else if (column.property !== undefined) {
											sort.property = column.property;
											sort.invert = false;
										}

										if (column.sortFormatter === undefined) {
											sort.formatter = column.formatter;
										} else {
											sort.formatter = column.sortFormatter;
										}

										vnode.attrs.sort(sort);
									}
								},
							}, [
								m("div.TableHeader", {
									class: SetClass({
										"TableHeader--active": vnode.attrs.sort !== undefined && vnode.attrs.sort().property === column.property,
										"TableHeader--pointer": vnode.attrs.sort !== undefined,
									}),
								}, [
									m("span", column.name),
									vnode.attrs.sort === undefined || column.noSort === true ?
										[] :
										m(Icon, {
											icon: vnode.attrs.sort().property === column.property ?
												vnode.attrs.sort().invert ?
													Icons.SortAscending:
													Icons.SortDescending :
												Icons.Sort,
										}),
								]),
								column.noFilter === true || vnode.attrs.noFilters === true ?
									[] :
									[
										m(Icon, {
											classes: "TableHeader--pointer",
											icon: Icons.Filter,
											onclick: async (e: m.Event<MouseEvent>) => {
												e.stopPropagation();

												if (state.filterProperty === column.property) {
													state.filterProperty = "";
												} else {
													state.filterName = column.name;
													state.filterProperty = column.property;
												}
											},
											style: {
												color: vnode.attrs.tableColumnsNameEnabled()[column.property] !== "" || state.filterProperty === column.property ?
													"var(--color_primary)" :
													undefined,
											},
										}),
									],
							]) :
							[];
					}),
				]),
				m("tr.TableHeader__filter", m(`div.${Animate.class(Animation.Fade)}`, {
					onclick: (e: m.Event<MouseEvent>) => {
						e.stopPropagation();
					},
				}, state.filterProperty === "" ?
					[] :
					[
						vnode.attrs.tableColumns[vnode.attrs.tableColumns.findIndex((column) => {
							return column.property === state.filterProperty;
						})].customFilter === undefined ?
							[] :
							m(FormItem, {
								buttonArray: vnode.attrs.tableColumns[vnode.attrs.tableColumns.findIndex((column) => {
									return column.property === state.filterProperty;
								})].customFilter,
								name: state.filterName,
								tooltip: "",
							}),
						m(FormItem, {
							input: {
								oninput: (e): void => {
									clearTimeout(state.timer);
									vnode.attrs.tableColumnsNameEnabled({
										...vnode.attrs.tableColumnsNameEnabled(),
										...{
											[state.filterProperty]: e,
										},
									});
									m.redraw();
								},
								type: "text",
								value: vnode.attrs.tableColumnsNameEnabled()[state.filterProperty],
							},
							name: state.filterName,
							tooltip: AppState.data.translations.tableHeaderFilterTooltip,
						}),
						m(Icon, {
							icon: Icons.Close,
							onclick: async (e: m.Event<MouseEvent>) => {
								e.stopPropagation();
								state.filterProperty = "";
							},
							style: {
								cursor: "pointer",
							},
						}),
					])),
			]);
		},
	};
}
