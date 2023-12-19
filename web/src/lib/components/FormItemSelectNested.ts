import "./FormItemSelectNested.css";

import { Color } from "@lib/types/Color";
import m from "mithril";

import { StringToID } from "../utilities/StringToID";
import type { IconName } from "./Icon";
import { Icon } from "./Icon";

export interface FormItemSelectNestedSelector {
	/** Color for the selector. */
	color?: string,

	/** Icon to display with the selector. */
	icon?: IconName,

	/** Level of the selector, will be indented. */
	level: number,

	/** ID of the selector. */
	id: NullUUID,

	/** Name of the selector. */
	name: string,
}

export interface FormItemSelectNestedAttrs {
	/** Name of the FormItem. */
	name: string,
	onselect(i: NullUUID): void,

	/** Options to select from. */
	options: FormItemSelectNestedSelector[],

	/** Help tooltip. */
	tooltip: string,

	/** Value of the FormItem. */
	value?: NullUUID,
}

export function FormItemSelectNested (): m.Component<FormItemSelectNestedAttrs> {
	return {
		view: (vnode): m.Children => {
			return m("div.FormItem", [
				m("div.FormItem__label", [
					m("label", {
						id: `form-item-label${StringToID(vnode.attrs.name)}`,
					}, vnode.attrs.name),
				]),
				m("ul.FormItemSelectNested__list", {
					id: `form-item-select${StringToID(vnode.attrs.name)}`,
					oncreate: (e) => {
						e.dom.scrollTop = document.getElementById(`form-item-option${StringToID(vnode.attrs.name)}-${vnode.attrs.value}`)!.offsetTop - 50; // eslint-disable-line @typescript-eslint/no-non-null-assertion
					},
				}, vnode.attrs.options.map((option) => {
					return m("li.FormItemSelectNested__option", {
						class: vnode.attrs.value === option.id ?
							"FormItemSelectNested__option--selected" :
							undefined,
						id: `form-item-option${StringToID(vnode.attrs.name)}-${option.id}`,
						onclick: () => {
							vnode.attrs.onselect(option.id);
						},
						style: {
							"padding-left": `${(option.level + 1) * 10}px`,
						},
					}, [
						option.icon === undefined ?
							[] :
							m(Icon, {
								icon: option.icon,
								style: {
									color: option.color === undefined ?
										undefined :
										Color.toHex(option.color),
								},
							}),
						option.name,
					]);
				})),
			]);
		},
	};
}
