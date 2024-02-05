import "./AppToolbar.css";

import { Button } from "@lib/components/Button";
import { Icon } from "@lib/components/Icon";
import { DisplayEnum } from "@lib/types/Display";
import m from "mithril";

import { AppState } from "../states/App";
import { Icons } from "../types/Icons";
import type { AppToolbarActionAttrs } from "./AppToolbarAction";
import { AppToolbarAction } from "./AppToolbarAction";

export interface AppBreadcrumb {
  /** Link for the breadcrumb. */
  link?: string;

  /** Name of the breadcrumb. */
  name: string;
}

export interface AppToolbarAttrs {
  /** Actions to show in Toolbar. */
  actions(): AppToolbarActionAttrs;
}

export function AppToolbar(): m.Component<AppToolbarAttrs> {
  return {
    view: (vnode): m.Children => {
      return m("div.AppToolbar", [
        m("div.AppToolbar__breadcrumbs#breadcrumbs", [
          m(
            m.route.Link,
            {
              href: AppState.isSessionAuthenticated() ? "/home" : "/signin",
              options: {
                state: {
                  key: Date.now(),
                },
              },
            },
            m(Icon, {
              icon: Icons.Home,
              style: {
                "font-weight": "var(--font-weight_normal)",
              },
            }),
          ),
          AppState.getLayoutAppBreadcrumbs().map((breadcrumb, index) => {
            return [
              index === 0 || index < AppState.getLayoutAppBreadcrumbs().length
                ? m("span", " > ")
                : [],
              m(
                breadcrumb.link === undefined
                  ? ("span" as any) // eslint-disable-line @typescript-eslint/no-explicit-any
                  : m.route.Link,
                {
                  href: breadcrumb.link,
                  options:
                    breadcrumb.link === undefined
                      ? undefined
                      : {
                          state: {
                            key: Date.now(),
                          },
                        },
                },
                breadcrumb.name,
              ),
            ];
          }),
        ]),
        AppState.isSessionAuthenticated()
          ? m("div.AppToolbar__buttons#toolbar-buttons", [
              m(Button, {
                icon: Icons.Awake,
                iconOnly: AppState.data.sessionDisplay < DisplayEnum.Small,
                name: AppState.data.translations.actionKeepAwake,
                onclick: async (): Promise<void> => {
                  return AppState.toggleSessionSleepDisabled();
                },
                permitted: AppState.getSessionDisplay() <= DisplayEnum.Large,
                requireOnline: true,
                secondary: AppState.isSessionSleepDisabled(),
              }),
              m(Button, {
                accent: true,
                icon: Icons.Help,
                iconOnly: AppState.data.sessionDisplay < DisplayEnum.Small,
                name: AppState.data.translations.help,
                onclick: async (): Promise<void> => {
                  return new Promise((resolve) => {
                    AppState.toggleLayoutAppHelpOpen();

                    return resolve();
                  });
                },
                permitted: true,
                requireOnline: false,
              }),
              m(AppToolbarAction, vnode.attrs.actions()),
            ])
          : [],
      ]);
    },
  };
}
