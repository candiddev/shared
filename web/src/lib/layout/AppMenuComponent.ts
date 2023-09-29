import type { IconName } from "@lib/components/Icon";
import { Icon } from "@lib/components/Icon";
import m from "mithril";
import type Stream from "mithril/stream";

import { AppState } from "../states/App";
import { DisplayEnum } from "../types/Display";
import { Animate, Animation } from "../utilities/Animate";
import { SetClass } from "../utilities/SetClass";
import { StringToID } from "../utilities/StringToID";
import type { AppMenuComponentViewItem } from "./AppMenuComponentView";
import { AppMenuComponentView } from "./AppMenuComponentView";
import type { AppMenuNestedAttrs } from "./AppMenuNested";
import { AppMenuNested } from "./AppMenuNested";

export interface AppMenuComponentView {
	colorFormatter?(m: AppMenuComponentViewItem): string | undefined,
	countFormatter?(): number | string,
	countFormatterView?(m: AppMenuComponentViewItem): string,

	/** Icon for the view, if applicable. */
	icon?: IconName,
	init?(): void,

	/** A list of items to render under a view.  If this is defined, the view will become a header. */
	items?: Stream<AppMenuComponentViewItem[]>,

	/** An icon to use for all of the items. */
	itemsIcon?: IconName,
	itemsIconFormatter?(m: AppMenuComponentViewItem): IconName,

	/** Can the items only be used online? */
	itemsRequireOnline?: boolean,

	/** Use the ID of the view item when constructing links instead of name. */
	itemsUseID?: boolean,

	/** A link for the view when clicked.  Will be appended to the component path. */
	link: string,

	/** Instead of appending to the component path, go directly to the link. */
	linkOnly?: boolean,

	/** When matching against navPath to see if active, match exactly the path instead of just the beginning. */
	matchExact?: boolean,

	/** Name of the view.  Will be used to construct links. */
	name: string,

	/** Render nested data instead. */
	nested?: AppMenuNestedAttrs,

	/** Query key to append to the constructed link. */
	query?: string,
	remove?(): void,

	/** Does the view only work online? */
	requireOnline?: boolean,
}

export interface AppMenuComponentAttrs {
	/** The parent component name, lowercase. */
	cLower: string,

	/** A list of views to render for the parent component. */
	views: Stream<AppMenuComponentView[]>,
}

export function AppMenuComponent (): m.Component<AppMenuComponentAttrs> {
	return {
		onbeforeremove: Animate.onbeforeremove(Animation.Expand),
		oninit: (vnode): void => {
			vnode.attrs.views()
				.map(async (view: AppMenuComponentView | null) => {
					if (view !== null && view.init !== undefined) {
						view.init();
					}
				});
		},
		onremove: async (vnode): Promise<void> => {
			vnode.attrs.views()
				.map(async (view: AppMenuComponentView | null) => {
					if (view !== null && view.remove !== undefined) {
						return view.remove();
					}
				});
		},
		view: (vnode): m.Children => {
			return m("ul.AppMenu__menu.AppMenu__menu--comp", {
				class: AppState.getLayoutAppMenuPath()
					.startsWith(`/${vnode.attrs.cLower}`) ?
					"AppMenu__menu--open" :
					undefined,
				id: `app-menu-${vnode.attrs.cLower}`,
			}, [
				vnode.attrs.views()
					.map((v: AppMenuComponentView | null): m.Children => {
						if (v === null || ! AppState.isSessionOnline() && v.requireOnline === true) {
							return [];
						}

						const vLower = v.name.toLowerCase();
						let vRoute = "";

						if (v.link !== "") {
							if (v.linkOnly === true || v.link.startsWith("http")) {
								vRoute = v.link;
							} else {
								vRoute = `/${vnode.attrs.cLower}${v.link}`;
							}
						}

						return [
							m("li.AppMenu__entry", {
								class: SetClass({
									"AppMenu__entry--active": v.icon !== undefined && (v.matchExact === true && m.route.get() === vRoute || v.matchExact !== true && m.route.get()
										.includes(vRoute)),
									"AppMenu__entry--disabled": v.items !== undefined && v.icon === undefined,
									"AppMenu__entry--header": v.items !== undefined || v.nested !== undefined,
								}),
								id: `app-menu-${vnode.attrs.cLower}-view${StringToID(vLower)}`,
							}, [
								m(v.icon === undefined ?
									"p" as any : // eslint-disable-line @typescript-eslint/no-explicit-any
									m.route.Link, {
									href: v.icon === undefined ?
										undefined :
										vRoute,
									id: `app-menu-${vnode.attrs.cLower}-view${StringToID(vLower)}-link`,
									onclick: v.icon === undefined ?
										undefined :
										(): void => {
											if (AppState.getSessionDisplay() !== DisplayEnum.XLarge) {
												AppState.toggleLayoutAppMenuOpen(false);
											}
										},
									options: v.icon === undefined ?
										undefined :
										{
											state: {
												key: Date.now(),
											},
										},
									target: vRoute.startsWith("/") ?
										undefined :
										"_blank",
								}, [
									v.items !== undefined || v.nested !== undefined ?
										[] :
										m(Icon, {
											icon: v.icon,
										}),
									m("span.AppMenu__entry--text", v.name),
									v.countFormatter === undefined || v.countFormatter() === 0 ?
										[] :
										m("span.GlobalCount", `${v.countFormatter()}`),
									v.items !== undefined && v.icon !== undefined ?
										m(m.route.Link,  {
											href: vRoute,
											options: {
												state: {
													key: Date.now(),
												},
											},
										}, m(Icon, {
											icon: v.icon,
										})) :
										[],
								]),
							]),
							v.itemsRequireOnline === undefined || v.itemsRequireOnline === true && AppState.isSessionOnline() ?
								v.nested === undefined ?
									v.items !== undefined && v.items().length > 0 ?
										m(AppMenuComponentView, {
											cLower: vnode.attrs.cLower,
											colorFormatter: v.colorFormatter,
											countFormatter: v.countFormatterView,
											items: v.items,
											itemsIcon: v.itemsIcon,
											itemsIconFormatter: v.itemsIconFormatter,
											itemsUseID: v.itemsUseID,
											query: v.query,
											vLower: vLower,
											vroute: v.link !== undefined && v.link.startsWith("?") ?
												`/${vnode.attrs.cLower}` :
												vRoute,
										}) :
										[] :
									m(AppMenuNested, v.nested) :
								[],
						];
					}),
			]);
		},
	};
}
