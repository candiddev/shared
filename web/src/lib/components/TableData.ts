import "./TableData.css";

import type { Err } from "@lib/services/Log";
import { Drag } from "@lib/utilities/Drag";
import m from "mithril";

import { AppState } from "../states/App";
import { Currency, CurrencyEnum } from "../types/Currency";
import { Duration } from "../types/Duration";
import { Icons } from "../types/Icons";
import { Timestamp } from "../types/Timestamp";
import { Animate, Animation } from "../utilities/Animate";
import { SetClass } from "../utilities/SetClass";
import { Sort } from "../utilities/Sort";
import { StringToID } from "../utilities/StringToID";
import { Icon } from "./Icon";
import { Markdown } from "./Markdown";
import { NoImage } from "./NoImage";
import type { TableColumnAttrs } from "./TableHeader";

export enum TableDataType {
	Bold,
	Checkbox,
	Collapsible,
	Currency,
	Date,
	Drag,
	Duration,
	Icon,
	Image,
	Link,
	Secret,
	Text,
	Timestamp,
}

function onDrag (srcID: string, x: number, y: number): void {
	const elNew = x === 0 && y === 0 ?
		(document.elementFromPoint(Drag.state.x, Drag.state.y) as HTMLElement).closest("tr") :
		(document.elementFromPoint(x, y) as HTMLElement)
			.closest("tr");

	// Check if elNew is an item and isn't the same as the source
	if (elNew !== null && elNew.tagName === "TR" && elNew.parentElement?.tagName === "TBODY") {
		const src = document.getElementById(srcID) as HTMLElement;
		const elOld = document.getElementById(Drag.state.target);

		// If targetting the srcID
		if (elNew === src) {
			return;
		}

		if (elNew !== elOld) {
			Drag.setDragTarget(elNew, "TableData__dragtarget");

			if (elOld !== null) {
				elOld.classList.remove("TableData__dragtarget");
			}
		}

		if (Drag.isSourceAfter(x === 0 && y === 0 ?
			Drag.state.y :
			y, elNew)) {
			Drag.moveSrcAfter(src, elNew);
		} else {
			Drag.moveSrcBefore(src, elNew);
		}

	}
}

async function onDragEnd (dragEnd: () => Promise<void | Err>): Promise<void> {
	Drag.end("TableData__dragtarget");

	const el = document.getElementById(Drag.state.source) as HTMLElement;

	return dragEnd()
		.then(() => {
			el.classList.remove("TableData__dragging"); // Or just remove the class
		})
		.catch(() => {
			if (Drag.state.parent !== null) {
				Drag.state.parent.insertBefore(el, Drag.state.parent.children[Drag.state.position]);
			}
		});
}

function onDragStart (el: HTMLElement): void {
	Drag.start(el.parentElement?.tagName === "TD"
		? el.parentElement?.parentElement as HTMLElement
		: el.parentElement as HTMLElement, "TableData__dragging");
}

export function TableData (): m.Component<TableColumnAttrs> {
	let hidden = true;

	return {
		view: (vnode): m.Children => {
			const id = `table-data${StringToID(vnode.attrs.id)}`;

			if (vnode.attrs.render !== undefined) {
				return m("td.TableData", {
					id: id,
				}, m(vnode.attrs.render, vnode.attrs.data));
			}

			let data: boolean | number | null | object | string | string[] | undefined;

			if (vnode.attrs.formatter !== undefined) {
				data = vnode.attrs.formatter(vnode.attrs.data);
			} else if (vnode.attrs.data !== undefined) {
				data = vnode.attrs.data[vnode.attrs.property];
			}

			if (typeof data === "object") {
				if (Array.isArray(data) && data.length !== 0) {
					Sort(data);
					return m(`td.TableData.${Animate.class(Animation.Fade)}`, m("div.TableData__array", {
						id: id,
					}, data.map((item: string): m.Children => {
						return m(m.route.Link, {
							class: "GlobalLink TableData__link",
							href: vnode.attrs.linkFormatter === undefined ?
								"" :
								vnode.attrs.linkFormatter(item),
							onclick: (e: MouseEvent): void => {
								e.stopPropagation();
							},
						}, item);
					})));
				}

				return m(`td.TableData.${Animate.class(Animation.Fade)}`, "");
			}

			const c = SetClass({
				"TableData": true,
				[Animate.class(Animation.Fade)]: true,
				"TableData--negative": vnode.attrs.positive !== undefined && vnode.attrs.positive(vnode.attrs.data) === false,
				"TableData--positive": vnode.attrs.positive !== undefined && vnode.attrs.positive(vnode.attrs.data) === true,
				"TableData--right": vnode.attrs.rightAlign === true,
			});

			switch (vnode.attrs.type) { // eslint-disable-line @typescript-eslint/switch-exhaustiveness-check
			case TableDataType.Bold:
				return m(`td.${c}.TableData--bold`, {
					id: id,
				}, data);
			case TableDataType.Checkbox:
				if (typeof data === "boolean" || typeof data === "undefined") {
					return m("td.TableData__checkbox", m(Icon, {
						icon: data === true ?
							Icons.CheckYes :
							Icons.CheckNo,
						id: id,
						onclick: async (e: MouseEvent) => {
							if (vnode.attrs.checkboxOnclick !== undefined && AppState.isSessionOnline() && vnode.attrs.permitted !== undefined && vnode.attrs.permitted()) {
								e.stopPropagation();

								return vnode.attrs.checkboxOnclick();
							}
						},
						style: {
							color: data === true ?
								"var(--color_secondary)" :
								undefined,
						},
					}));
				}
				break;
			case TableDataType.Collapsible:
				return m(`td.${c}.TableData--collapsible`, {
					id: id,
				}, [
					data,
					m(`i.GlobalButtonIconExpand${vnode.attrs.collapsedNames !== undefined && vnode.attrs.collapsedNames.includes(`${data}`) ?
						"" :
						".GlobalButtonIconExpand--active"}`, {
						onclick: (e: MouseEvent): void => {
							if (vnode.attrs.onclick !== undefined && typeof data === "string") {
								e.stopPropagation();
								vnode.attrs.onclick(data);
							}
						},
					}, Icons.Expand),
				]);
			case TableDataType.Currency:
				if (typeof data === "number") {
					return m(`td.TableData--right.${c}`, {
						class: data < 0 || vnode.attrs.positive !== undefined && vnode.attrs.positive(vnode.attrs.data) === false ?
							"TableData--negative" :
							"TableData--positive",
						id: id,
					}, Currency.toString(data, vnode.attrs.currencyFormat === undefined ?
						CurrencyEnum.USD :
						vnode.attrs.currencyFormat));
				}
				break;
			case TableDataType.Date:
				if (typeof data === "string") {
					return m(`td.${c}`, {
						id: id,
					}, AppState.formatCivilDate(data));
				}
				break;
			case TableDataType.Drag:
				return m("td.TableData__draggable", {
					draggable: true,
					ondrag: (e: m.Event<DragEvent>) => {
						e.redraw = false;

						onDrag(`${e.target.parentElement?.id}`, e.clientX, e.clientY);
					},
					ondragend: async () => {
						if (vnode.attrs.ondragend !== undefined) {
							return onDragEnd(vnode.attrs.ondragend);
						}
					},
					ondragstart: async (e: m.Event<DragEvent>) => {
						if (process.env.NODE_ENV !== "test") {
							e.dataTransfer!.setDragImage(e.target.parentElement!, 0, 0); // eslint-disable-line @typescript-eslint/no-non-null-assertion
						}

						onDragStart(e.target);
					},
					ontouchend: async () => {
						if (vnode.attrs.ondragend !== undefined) {
							return onDragEnd(vnode.attrs.ondragend);
						}
					},
					ontouchmove: async (e: m.Event<TouchEvent>) => { // eslint-disable-line @typescript-eslint/no-explicit-any
						e.redraw = false;
						e.preventDefault();
						const touches = e.changedTouches[0];
						const id = `${e.target.parentElement?.tagName === "TD"
							? e.target.parentElement?.parentElement?.id
							: e.target.parentElement?.id}`;
						onDrag(id, touches.clientX, touches.clientY);
					},
					ontouchstart: async (e: m.Event<TouchEvent>) => {
						onDragStart(e.target);
					},
				}, [
					m(Icon, {
						icon: Icons.Drag,
					}),
					m("span", data),
				]);
			case TableDataType.Duration:
				if (typeof data === "number") {
					return m(`td.${c}`, {
						id: id,
					}, Duration.toString(data));
				}
				break;
			case TableDataType.Icon:
				return m(`td.${c}.TableData__icon`, {
					id: id,
				}, data === undefined ?
					"" :
					data.toString()
						.split(" ")
						.map((icon) => {
							return m(Icon, {
								icon: icon,
							});
						}));
			case TableDataType.Image:
				return m("td.TableData.TableData--center", {
					id: id,
				}, data === "" ?
					m(NoImage) :
					m("img.TableData__img", {
						id: `${id}-img`,
						loading: "lazy",
						src: data,
					}),
				);
			case TableDataType.Link:
				if (vnode.attrs.linkRequireOnline === true && ! AppState.isSessionOnline()) {
					return m(`td.${c}`, {
						id: id,
					}, data);
				}
				if (data === "") {
					return m(`td.${c}`);
				}
				return m(`td.GlobalLink.${c}`, {
				}, vnode.attrs.linkExternal === true ?
					m("a", {
						href: vnode.attrs.linkFormatter === undefined ?
							"" :
							vnode.attrs.linkFormatter(vnode.attrs.data),
						onclick: (e: MouseEvent) => {
							e.stopPropagation();
						},
						rel: "nofollow",
						target: "_blank",
					}, data) :
					m(m.route.Link, {
						class: "TableData__link",
						href: vnode.attrs.linkFormatter === undefined ?
							"" :
							vnode.attrs.linkFormatter(vnode.attrs.data),
						onclick: (e: MouseEvent) => {
							e.stopPropagation();
						},
					}, [
						m("span", {
							id: id,
						}, data),
					]));
			case TableDataType.Secret:
				return data === "" ?
					m(`td.${c}`) :
					m(`td.TableData__link.${c}`, {
						id: id,
						onclick: (e: m.Event<MouseEvent>) => {
							e.stopPropagation();
							hidden = !hidden;
						},
					}, [
						hidden ?
							"********" :
							m(Markdown, {
								value: `${data}`,
							}),
						m(Icon, {
							icon: hidden ?
								Icons.Hide :
								Icons.Show,
							style: {
								"padding-left": "var(--padding)",
							},
						}),
						m(Icon, {
							icon: Icons.Clipboard,
							onclick: async (e: m.Event<MouseEvent>) => {
								e.stopPropagation();

								return navigator.clipboard.writeText(data as string)
									.then(() => {
										AppState.setLayoutAppAlert({
											message: "Value Copied",
										});

										m.redraw();
									});
							},
							style: {
								"padding-left": "var(--padding)",
							},
						}),
					]);
			case TableDataType.Timestamp:
				if (typeof data === "string") {
					return m(`td.${c}`, {
						id: id,
					}, AppState.formatCivilDate(Timestamp.fromString(data)
						.toCivilDate()));
				}
				break;
			}

			return m(`td.${c}`, {
				id: id,
			}, m(Markdown, {
				value: `${data}`,
			}));
		},
	};
}
