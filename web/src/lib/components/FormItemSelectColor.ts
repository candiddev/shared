import { AppState } from "@lib/states/App";
import { ColorEnum } from "@lib/types/Color";
import m from "mithril";

import { FormItem } from "./FormItem";
import { FormItemInput } from "./FormItemInput";

export interface FormItemSelectColorAttrs {
	/** Is the FormItem disabled? */
	disabled?: boolean,

	/** Override default name. */
	name?: string,

	oninput(e: string): void,

	/** Value of the FormItem. */
	value: string,
}

export function FormItemSelectColor (): m.Component<FormItemSelectColorAttrs> {
	return {
		view: (vnode): m.Children => {
			return [
				m(FormItem, {
					name: vnode.attrs.name === undefined ?
						AppState.data.translations.formItemSelectColorName :
						vnode.attrs.name,
					select: {
						disabled: vnode.attrs.disabled,
						oninput: (e: string): void => {
							if (e === "custom") {
								vnode.attrs.oninput("#000000");
							} else if (e === "default") {
								vnode.attrs.oninput("");
							} else {
								vnode.attrs.oninput(e);
							}
						},
						options: [
							...AppState.data.translations.formItemSelectColorValues.map((color) => {
								return {
									color: AppState.preferences().darkMode ?
										ColorEnum[color.id].dark :
										ColorEnum[color.id].light,
									id: color.id,
									name: color.name,
								};
							}),
							{
								id: "custom",
								name: AppState.data.translations.colorCustom,
							},
						],
						value: vnode.attrs.value.startsWith("#") ?
							"custom" :
							vnode.attrs.value === "" ?
								"default" :
								vnode.attrs.value,
					},
					tooltip: AppState.data.translations.formItemSelectColorTooltip,
				}),
				vnode.attrs.value.startsWith("#") ?
					m(FormItemInput, {
						name: "",
						oninput: (e: string): void => {
							vnode.attrs.oninput(e);
						},
						type: "color",
						value: vnode.attrs.value,
					}) :
					[],
			];
		},
	};
}
