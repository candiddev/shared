import "./App.css";

import { Drag } from "@lib/utilities/Drag";
import m from "mithril";
import type Stream from "mithril/stream";

import { Button } from "../components/Button";
import { Markdown } from "../components/Markdown";
import { Log } from "../services/Log";
import { AppState } from "../states/App";
import { Animate, Animation } from "../utilities/Animate";
import { SetClass } from "../utilities/SetClass";
import { AppAlerts } from "./AppAlerts";
import { AppForm } from "./AppForm";
import { AppHeader } from "./AppHeader";
import { AppHelp } from "./AppHelp";
import type { AppLogoAttrs, AppLogoComponentAttrs } from "./AppLogo";
import type { AppMenuComponent } from "./AppMenu";
import { AppMenu } from "./AppMenu";
import { AppToolbar } from "./AppToolbar";
import type { AppToolbarActionAttrs } from "./AppToolbarAction";

export interface AppAttrs {
	/** A component to render a Contact Us block below appropriate items. */
	contactUs(): m.Component,

	/** Don't pad the width of children. */
	fullWidth?: boolean,

	/** Hide the header and menu. */
	hideHeader?: boolean,

	/** A component to render a logo within items. */
	logo(): m.Component<AppLogoComponentAttrs>,

	/** A list of Menu Components to render. */
	menuComponents: Stream<AppMenuComponent[]>,

	/** Whether to redirect page to signin. */
	public?: boolean,

	/** Handlers for App Search.*/
	searcher: AppLogoAttrs["searcher"],

	/** A list of toolbar actions to display across all pages. */
	toolbarActions(): AppToolbarActionAttrs,
}

export function App (): m.Component<AppAttrs> {
	return {
		oncreate: async (vnode): Promise<void> => {
			document.onkeydown = (e): void => {
				switch (e.key) {
				case "Escape":
					if (AppState.getLayoutAppForm().component !== null) {
						AppState.setLayoutAppForm();
					}

					if (AppState.isLayoutAppHelpOpen()) {
						AppState.toggleLayoutAppHelpOpen(false);
					}
					break;
				}

				if (!document.activeElement?.tagName.toLowerCase()
					.match(/input|select|textarea/)) {
					switch (e.key) {
					case "a":
						AppState.setComponentsDropdownMenu("app-toolbar-action", 0);
						break;
					case ",":
						AppState.toggleLayoutAppMenuOpen();
					}
				}
			};

			await AppState.oncreate();

			if (!AppState.isSessionAuthenticated() && vnode.attrs.public !== true) {
				m.route.set("/signin", {}, {
					replace: true,
				});
			}
		},
		view: (vnode): m.Children => {
			Log.debug("Redrawing");

			return m("main.App", {
				class: vnode.attrs.hideHeader === true ?
					"App--primary" :
					undefined,
				id: "app",
				key: m.route.get(),
				onclick: (e: m.Event<MouseEvent>) => {
					e.redraw = false;

					if (AppState.getComponentsDropdownMenu() !== "") {
						AppState.setComponentsDropdownMenu("", 0);
						m.redraw();
					}
				},
				ondragover: (e: m.Event<DragEvent>) => {
					Drag.setXY(e.clientX, e.clientY);
				},
				style: AppState.style,
			}, [
				vnode.attrs.hideHeader === true || ! AppState.isSessionAuthenticated() ?
					[] :
					m(AppHeader, {
						logo: vnode.attrs.logo,
					}),
				m("section#app-section.App__section", [
					vnode.attrs.hideHeader === true || ! AppState.isSessionAuthenticated() ?
						[] :
						m(AppMenu, {
							components: vnode.attrs.menuComponents(),
							contactUs: vnode.attrs.contactUs,
							logo: {
								logo: vnode.attrs.logo,
								searcher: vnode.attrs.searcher,
							},
						}),
					m(AppHelp),
					m(AppForm),
					m(AppAlerts),
					m("div.App__children", {
						class: SetClass({
							"App__children--full": vnode.attrs.hideHeader === true,
							"App__children--full-width": vnode.attrs.fullWidth === true,
						}),
					}, [
						AppState.motd() !== undefined && !AppState.isSessionHideMOTD() && vnode.attrs.hideHeader !== true ?
							m("p.App__motd#motd", {
								onbeforeremove: Animate.onbeforeremove(Animation.Fade),
							}, [
								m(Markdown, {
									value: AppState.motd(),
								}),
								m(Button, {
									name: AppState.data.translations.actionDismiss,
									onclick: async (): Promise<void> => {
										return new Promise((resolve) => {
											AppState.setSessionHideMOTD();
											return resolve();
										});
									},
									permitted: true,
									requireOnline: false,
								}),
							],
							) :
							[],
						vnode.attrs.hideHeader === true ?
							[] :
							m(AppToolbar, {
								actions: vnode.attrs.toolbarActions,
							}),
						vnode.children,
					]),
				]),
			]);
		},
	};
}
