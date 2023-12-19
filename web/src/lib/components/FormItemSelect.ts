import "./FormItem.css";

import { AppState } from "@lib/states/App";
import m from "mithril";

import { StringToID } from "../utilities/StringToID";

interface OptionObject {
	color?: string,
	id?: NullUUID,
	name?: string,
	selected?: boolean,
}

export interface FormItemSelectAttrs {
	/** Is the FormItem disabled? */
	disabled?: boolean,

	/** Can multiple entries be selected? */
	multiple?: boolean,

	/** Name of the FormItem. */
	name?: string,
	oninput(value: number | string, element: HTMLSelectElement): void,

	/** Options that can be selected. */
	options: (number | string | OptionObject)[],

	/** Is the FormItem required? */
	required?: boolean,

	/** Value of the FormItem. */
	value?: boolean | number | string | string[] | null,
}

export function FormItemSelect (): m.Component<FormItemSelectAttrs> {
	return {
		view: (vnode): m.Children => {
			return [
				m("select.FormItem__field", {
					disabled: vnode.attrs.disabled,
					id: `form-item-select${StringToID(vnode.attrs.name)}`,
					multiple: vnode.attrs.multiple,
					oncreate: () => {
						m.redraw();
					},
					oninput: (e: m.Event<any>) => { // eslint-disable-line @typescript-eslint/no-explicit-any
						vnode.attrs.oninput(e.target.value, e.target as HTMLSelectElement);
					},
					required: vnode.attrs.required,
					size: vnode.attrs.multiple === true && typeof vnode.attrs.options === "object" ?
						vnode.attrs.options.length :
						undefined,
					value: vnode.attrs.value,
				}, vnode.attrs.options.map((option): m.Children => {
					if (typeof option === "object") {
						return m("option", {
							oncreate: (vnode) => {
								if (option.selected === true) {
									const dom = vnode.dom as HTMLOptionElement; // eslint-disable-line @typescript-eslint/consistent-type-assertions
									dom.selected = true;
								}
							},
							style: {
								color: option.color === undefined ?
									undefined :
									option.color,
							},
							value: option.id === undefined ?
								option.name :
								option.id,
						}, option.name);
					}
					return m("option", option);
				})),
				vnode.attrs.multiple === true && vnode.attrs.disabled !== true ?
					m("div.FormItem__bottom", {
					}, m("span.GlobalLink", {
						id: `form-item-select-none${StringToID(vnode.attrs.name)}`,
						onclick: () => {
							const el = document.getElementById(`form-item-select${StringToID(vnode.attrs.name)}`) as HTMLSelectElement; // eslint-disable-line @typescript-eslint/consistent-type-assertions
							el.selectedIndex = -1;
							vnode.attrs.oninput("", el);
						},
					}, AppState.data.translations.actionDeselectAll),
					) :
					[],
			];
		},
	};
}
