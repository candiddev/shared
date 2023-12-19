import "./AppAlerts.css";

import { Button } from "@lib/components/Button";
import m from "mithril";

import { AppState } from "../states/App";
import { Animate, Animation } from "../utilities/Animate";

export interface AppAlert {
	/** Optional list of buttons to render with Alert. */
	actions?: {
		/** Button name. */
		name: string,
		onclick (): Promise<void>,
	}[],

	/** Message for the alert.  Will be deduplicated. */
	message: string,

	/** Persist the alert instead of removing it eventually. */
	persist?: boolean,
}

export function AppAlerts (): m.Component {
	return {
		view: (): m.Children => {
			return m("div.AppAlerts", AppState.getLayoutAppAlerts()
				.map((alert) => {
					return m(`p.AppAlerts__alert.${Animate.class(Animation.FromRight)}`, {
						onbeforeremove: Animate.onbeforeremove(Animation.FromRight),
					}, [
						m("span", alert.message),
						alert.actions === undefined ?
							[] :
							m("div.AppAlerts__actions", alert.actions.map((action) => {
								return m(Button, {
									name: action.name,
									onclick: async () => {
										if (action.onclick === undefined) {
											AppState.clearLayoutAppAlert(alert.message);
										} else {
											return action.onclick();
										}
									},
									permitted: true,
									requireOnline: false,
									secondary: true,
								});
							})),
					]);
				}));
		},
	};
}
