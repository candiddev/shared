import "./AppMenuFooter.css";

import { AppState } from "@lib/states/App";
import m from "mithril";

export function AppMenuFooter (): m.Component {
	return {
		view: (): m.Children => {
			return m("footer#app-menu-footer.AppMenuFooter", [
				m("span#app-menu-footer-version", `${AppState.product} ${process.env.BUILD_VERSION}`),
				m("span", [
					`© 2018-${new Date()
						.getFullYear()} `,
					m("a.GlobalLink", {
						href: "https://www.candid.dev",
						target: "_blank",
					}, "Candid Development LLC"),
				]),
				m("span", "👋 from La Crosse, Wisconsin, USA"),
			]);
		},
	};
}
