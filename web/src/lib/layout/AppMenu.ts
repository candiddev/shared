import "./AppMenu.css";

import type { IconName } from "@lib/components/Icon";
import { Icon } from "@lib/components/Icon";
import m from "mithril";
import type Stream from "mithril/stream";

import { AppState } from "../states/App";
import { DisplayEnum } from "../types/Display";
import { Icons } from "../types/Icons";
import { SetClass } from "../utilities/SetClass";
import { StringToID } from "../utilities/StringToID";
import type { AppLogoAttrs } from "./AppLogo";
import { AppLogo } from "./AppLogo";
import type { AppMenuComponentView } from "./AppMenuComponent";
import { AppMenuComponent } from "./AppMenuComponent";
import { AppMenuFooter } from "./AppMenuFooter";

export interface AppMenuComponent {
  countFormatter?(): number | string;

  /** Icon for component. */
  icon: IconName;
  init?(): void;

  /** Link to component, if applicable. */
  link: string;

  /** Name of component. */
  name: string;
  onclick?(): Promise<void>;
  permitted(): boolean;

  /** Does the component need to be online to work? */
  requireOnline: boolean;

  /** Child Views to render below component. */
  views?: Stream<AppMenuComponentView[]>;
}

export interface AppMenuAttrs {
  /** A list of components for the menu. */
  components: AppMenuComponent[];
  contactUs(): m.Component;

  /** Logo attributes. */
  logo: AppLogoAttrs;
}

export function AppMenu(): m.Component<AppMenuAttrs> {
  return {
    view: (vnode): m.Children => {
      return m(
        "nav.AppMenu#app-menu",
        {
          class: SetClass({
            "AppMenu--open": AppState.isLayoutAppMenuOpen(),
          }),
          onclick: (e: m.Event<MouseEvent>) => {
            e.stopPropagation();
          },
        },
        AppState.isLayoutAppMenuOpen()
          ? m("div.AppMenu__container#app-menu-container", [
              m(AppLogo, vnode.attrs.logo),
              vnode.attrs.components.map((c: AppMenuComponent): m.Children => {
                if (
                  (c.requireOnline && !AppState.isSessionOnline()) ||
                  !c.permitted()
                ) {
                  return [];
                }

                return [
                  c.name === "Settings" ? m("li.AppMenu__entry--break") : [],
                  m(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    c.views === undefined ? m.route.Link : ("li" as any),
                    {
                      class: SetClass({
                        AppMenu__component: true,
                        "AppMenu__component--menu": c.views !== undefined,
                        AppMenu__entry: true,
                        "AppMenu__entry--active":
                          c.link !== "" &&
                          AppState.getLayoutAppMenuPath().startsWith(
                            `/${c.link}`,
                          ),
                      }),
                      href: `/${c.link}`,
                      id: `app-menu-component${StringToID(c.link)}`,
                      onclick: async (): Promise<void> => {
                        if (c.onclick !== undefined) {
                          await c.onclick();
                        }

                        if (c.views === undefined && c.link !== "") {
                          AppState.setLayoutAppMenuPath(`/${c.link}`);

                          if (
                            AppState.getSessionDisplay() !== DisplayEnum.XLarge
                          ) {
                            AppState.toggleLayoutAppMenuOpen(false);
                          }
                        } else if (
                          AppState.getLayoutAppMenuPath().startsWith(
                            `/${c.link}`,
                          )
                        ) {
                          AppState.setLayoutAppMenuPath("");
                        } else {
                          AppState.setLayoutAppMenuPath(`/${c.link}`);
                        }
                      },
                      oninit: () => {
                        if (
                          AppState.isSessionAuthenticated() &&
                          c.init !== undefined
                        ) {
                          c.init();
                        }
                      },
                      options:
                        c.views === undefined
                          ? {
                              state: {
                                key: Date.now(),
                              },
                            }
                          : undefined,
                    },
                    [
                      m(Icon, {
                        icon: c.icon,
                      }),
                      m("span.AppMenu__entry--text", c.name),
                      c.countFormatter === undefined || c.countFormatter() === 0
                        ? []
                        : m("span.GlobalCount", `${c.countFormatter()}`),
                      c.views === undefined
                        ? []
                        : m(
                            `i.AppMenu__arrow.GlobalButtonIconExpand${
                              AppState.getLayoutAppMenuPath().startsWith(
                                `/${c.link}`,
                              )
                                ? ".GlobalButtonIconExpand--active"
                                : ""
                            }`,
                            Icons.Expand,
                          ),
                    ],
                  ),
                  c.views !== undefined // eslint-disable-line no-negated-condition
                    ? m(AppMenuComponent, {
                        cLower: c.link,
                        views: c.views,
                      })
                    : [],
                ];
              }),
              m(vnode.attrs.contactUs),
              m(AppMenuFooter),
            ])
          : [],
      );
    },
  };
}
