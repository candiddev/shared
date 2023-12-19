import type { IconName } from "@lib/components/Icon";
import { Icon } from "@lib/components/Icon";
import { AppState } from "@lib/states/App";
import { Color } from "@lib/types/Color";
import { DisplayEnum } from "@lib/types/Display";
import { Icons } from "@lib/types/Icons";
import m from "mithril";
import type Stream from "mithril/stream";

export interface AppMenuNestedData {
	/** Children to render below main data. */
	children?: AppMenuNestedData[],

	/** Color for the icon. */
	color?: string,

	/** Replacement icon for the default. */
	icon?: IconName,

	/** ID for the item. */
	id: NullUUID,

	/** Name to show in the menu. */
	name: string,
}

interface AppMenuNestedBaseAttrs {
	findCount?(data: AppMenuNestedData): number,
	href(data: AppMenuNestedData): string,

	/** Default icon to use if data does not provide one. */
	icon: IconName,

	isCollapsed(id: NullUUID): boolean,
	onclickCollapse(id: NullUUID): Promise<void>,
	pathPrefix: string,
}

export interface AppMenuNestedAttrs extends AppMenuNestedBaseAttrs {
	/** Data for the AppMenuNested, will be passed to the active and href functions. */
	data: Stream<AppMenuNestedData[]>,
}

interface AppMenuNestedEntryAttrs extends AppMenuNestedBaseAttrs {
	data: AppMenuNestedData,
}

function AppMenuNestedEntry (): m.Component<AppMenuNestedEntryAttrs> {
	return {
		view: (vnode): m.Children => {
			return [
				m("li.AppMenu__entry", {
					class: m.route.get()
						.includes(`${vnode.attrs.data.id}`) ?
						"AppMenu__entry--active" :
						undefined,
				}, [
					m(m.route.Link, {
						href: vnode.attrs.href(vnode.attrs.data),
						id: `app-menu-nested-${vnode.attrs.data.id}-link`,
						onclick: () => {
							if (AppState.getSessionDisplay() !== DisplayEnum.XLarge) {
								AppState.toggleLayoutAppMenuOpen(false);
							}
						},
						options: {
							state: {
								key: Date.now(),
							},
						},
					}, [
						m(Icon, {
							icon: vnode.attrs.data.icon === undefined || vnode.attrs.data.icon === "" ?
								vnode.attrs.icon :
								vnode.attrs.data.icon,
							style: vnode.attrs.data.color === undefined ?
								undefined :
								{
									color: Color.toHex(vnode.attrs.data.color),
								},
						}),
						m("span.AppMenu__entry--text", vnode.attrs.data.name),
						vnode.attrs.findCount !== undefined && vnode.attrs.findCount(vnode.attrs.data) > 0 ?
							m("span.GlobalCount", vnode.attrs.findCount(vnode.attrs.data)) :
							[],
					]),
					vnode.attrs.data.children !== undefined && vnode.attrs.data.children.length > 0 ?
						m(`i.AppMenu__arrow.GlobalButtonIconExpand${vnode.attrs.isCollapsed(vnode.attrs.data.id) ?
							"" :
							".GlobalButtonIconExpand--active"}`, {
							onclick: async () => {
								return vnode.attrs.onclickCollapse(vnode.attrs.data.id);
							},
						}, Icons.Expand) :
						[],
				]),
				AppState.getLayoutAppMenuPath()
					.startsWith(vnode.attrs.pathPrefix) && vnode.attrs.data.children !== undefined && vnode.attrs.data.children.length > 0 ?
					m("ul.AppMenu__menu.AppMenu__menu--view", {
						class: vnode.attrs.isCollapsed(vnode.attrs.data.id) ?
							undefined :
							"AppMenu__menu--open",
						id: `app-menu-notes-${vnode.attrs.data.id}`,
					}, vnode.attrs.data.children.map((child) => {
						return m(AppMenuNestedEntry, {
							data: child,
							findCount: vnode.attrs.findCount,
							href: vnode.attrs.href,
							icon: vnode.attrs.icon,
							isCollapsed: vnode.attrs.isCollapsed,
							onclickCollapse: vnode.attrs.onclickCollapse,
							pathPrefix: vnode.attrs.pathPrefix,
						});
					})) :
					[],
			];
		},
	};
}

export function AppMenuNested (): m.Component<AppMenuNestedAttrs> {
	return {
		view: (vnode): m.Children => {
			return vnode.attrs.data()
				.map((data) => {
					return m(AppMenuNestedEntry, {
						data: data,
						findCount: vnode.attrs.findCount,
						href: vnode.attrs.href,
						icon: vnode.attrs.icon,
						isCollapsed: vnode.attrs.isCollapsed,
						onclickCollapse: vnode.attrs.onclickCollapse,
						pathPrefix: vnode.attrs.pathPrefix,
					});
				});
		},
	};
}
