import "./ButtonArray.css";

import { Color } from "@lib/types/Color";
import m from "mithril";

import { Animate, Animation } from "../utilities/Animate";
import { SetClass } from "../utilities/SetClass";
import { StringToID } from "../utilities/StringToID";
import type { IconName } from "./Icon";
import { Icon } from "./Icon";

export interface ButtonArrayAttrs {
	/** Icon to add in front of each button. */
	icon?: IconName,

	/** Name of the button row, will be converted to an ID. */
	name?: string,
	onclick?(value: string): void,

	/** Is the ButtonArray required?  Used by FormItem. */
	required?: boolean,

	/** What values are currently selected. */
	selected?(): string[],

	/** Shrink the padding for the Buttons. */
	small?: boolean,

	/** The values available to be selected. */
	value: (string | {
		/** Optional color for the value. */
		color?: string,

		/** Icon for the value. */
		icon?: IconName,

		/** ID for the value. */
		id: NullUUID,

		/** Name of the value, will be displayed. */
		name: string,
	})[],

	/** Optional link prefix put in front of each button for links. */
	valueLinkPrefix?: string,
}

export function ButtonArray (): m.Component<ButtonArrayAttrs> {
	return {
		view: (vnode): m.Children => {
			return m(`div.ButtonArray.${Animate.class(Animation.Fade)}`, {
				id: `button-array${StringToID(vnode.attrs.name)}`,
			}, vnode.attrs.value.map((item) => {
				if (item === "") {
					return [];
				}

				const color = typeof item !== "string" && item.color !== undefined ?
					item.color :
					"";

				const id = typeof item === "string" ?
					item :
					`${item.id}`;

				const value = typeof item === "string" ?
					item :
					`${item.name}`;

				return m(vnode.attrs.valueLinkPrefix === undefined ?
					"p" as any : // eslint-disable-line @typescript-eslint/no-explicit-any
					m.route.Link, {
					class: SetClass({
						"ButtonArray__item": true, // eslint-disable-line camelcase
						"ButtonArray__item--small": vnode.attrs.small === true, // eslint-disable-line camelcase
						"ButtonArray__selected": vnode.attrs.selected !== undefined && vnode.attrs.selected() // eslint-disable-line camelcase
							.includes(id),
					}),
					href: vnode.attrs.valueLinkPrefix === undefined ?
						undefined :
						`${vnode.attrs.valueLinkPrefix}${id}`,
					id: `button-array${StringToID(vnode.attrs.name)}${StringToID(id)}`,
					onclick: (e: m.Event<MouseEvent>): void | boolean => {
						e.stopPropagation();

						if (vnode.attrs.onclick !== undefined) {
							vnode.attrs.onclick(id);
						} else if (vnode.attrs.selected === undefined) {
							vnode.attrs.value.splice(vnode.attrs.value.indexOf(id), 1);
						}
					},
					options: vnode.attrs.valueLinkPrefix === undefined ?
						undefined :
						{
							state: {
								key: Date.now(),
							},
						},
					style: {
						"background-color": color !== "" && vnode.attrs.selected !== undefined && vnode.attrs.selected() // eslint-disable-line camelcase
							.includes(id) ?
							Color.toHex(color) :
							undefined,
						"border-color": color === "" ?
							undefined :
							Color.toHex(color),
						"color": color !== "" && vnode.attrs.selected !== undefined && vnode.attrs.selected() // eslint-disable-line camelcase
							.includes(id) ?
							Color.contentColor(color) :
							undefined,
					},
				}, [
					vnode.attrs.icon !== undefined || typeof item !== "string" && item.icon !== undefined?
						m(Icon, {
							icon: typeof item !== "string" && item.icon !== undefined ?
								item.icon :
								vnode.attrs.icon,
						}) :
						[],
					m("span",
						value,
					),
				]);
			}));
		},
	};
}
