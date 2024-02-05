import "./Title.css";

import m from "mithril";

import { AppState } from "../states/App";
import { DisplayEnum } from "../types/Display";
import { Animate, Animation } from "../utilities/Animate";
import { SetClass } from "../utilities/SetClass";
import { StringToID } from "../utilities/StringToID";
import type { ButtonAttrs } from "./Button";
import { Button } from "./Button";
import { FormItemSelect } from "./FormItemSelect";

export interface TitleAttrs {
  /** Left button to display in the Title. */
  buttonLeft?: ButtonAttrs;

  /** Right button to display in the Title. */
  buttonRight?: ButtonAttrs;

  /** Custom class for the Title. */
  class?: string;

  /** Is the Title loaded?  If not, display placeholder. */
  loaded?: boolean;

  /** Name for the Title. */
  name?: string;

  /** Subtitle key/values to display below Title. */
  subtitles?: TitleAttrsSubtitle[];

  /** Tabs to display above Title. */
  tabs?: TitleAttrsTab[];
}

export interface TitleAttrsSubtitle {
  /** Color of the Subtitle key. */
  color?: string;

  /** Key of the subtitle. */
  key: string;

  /** Value of the subtitle. */
  value: string;
}

export interface TitleAttrsTab {
  /** Is this Tab active? */
  active: boolean;

  /** Is there a count that should be displayed within this Tab? */
  count?: number;

  /** Href link for this Tab. */
  href?: string;

  /** Name of this Tab. */
  name: string;
  onclick?(): void;
}

export function Title(): m.Component<TitleAttrs> {
  return {
    view: (vnode): m.Children => {
      return [
        vnode.attrs.loaded === undefined &&
        vnode.attrs.name === undefined &&
        vnode.attrs.buttonLeft === undefined &&
        vnode.attrs.buttonRight === undefined &&
        (vnode.attrs.tabs === undefined || vnode.attrs.tabs.length === 0)
          ? []
          : m(
              "div.Title",
              {
                class: vnode.attrs.class,
                id: `title${StringToID(vnode.attrs.name)}`,
              },
              [
                vnode.attrs.tabs === undefined || vnode.attrs.tabs.length === 0
                  ? []
                  : m(
                      "div.Title__tabs",
                      AppState.getSessionDisplay() < DisplayEnum.Medium
                        ? m(FormItemSelect, {
                            name: "Tab",
                            oninput: (t: string) => {
                              if (vnode.attrs.tabs !== undefined) {
                                const i = vnode.attrs.tabs.findIndex((tab) => {
                                  return tab !== null && t.startsWith(tab.name);
                                });

                                if (i !== undefined && i >= 0) {
                                  if (vnode.attrs.tabs[i].href !== undefined) {
                                    m.route.set(
                                      vnode.attrs.tabs[i].href as string,
                                      {},
                                      {
                                        state: {
                                          key: Date.now(),
                                        },
                                      },
                                    );
                                  } else if (
                                    vnode.attrs.tabs[i].onclick !== undefined
                                  ) {
                                    vnode.attrs.tabs[i].onclick!(); // eslint-disable-line @typescript-eslint/no-non-null-assertion
                                  }
                                }
                              }
                            },
                            options: vnode.attrs.tabs.reduce(
                              (arr, tab) => {
                                if (tab !== null) {
                                  arr.push({
                                    id: tab.name,
                                    name: `${tab.name}${
                                      tab.count !== undefined && tab.count > 0
                                        ? ` (${tab.count})`
                                        : ""
                                    }`,
                                  });
                                }

                                return arr;
                              },
                              [] as {
                                id: string; // eslint-disable-line jsdoc/require-jsdoc
                                name: string; // eslint-disable-line jsdoc/require-jsdoc
                              }[],
                            ),
                            value: vnode.attrs.tabs.filter((tab) => {
                              return tab !== null && tab.active;
                            })[0]?.name,
                          })
                        : [],
                      vnode.attrs.tabs.map((tab) => {
                        return m(
                          tab.href === undefined
                            ? ("p" as any) // eslint-disable-line @typescript-eslint/no-explicit-any
                            : m.route.Link,
                          {
                            class: SetClass({
                              Title__tab: true,
                              "Title__tab--active": tab.active,
                              "Title__tab--hidden":
                                AppState.getSessionDisplay() <
                                DisplayEnum.Medium,
                            }),
                            href: tab.href,
                            id: `tab${StringToID(tab.name)}`,
                            onclick: tab.onclick,
                            options:
                              tab.href === undefined
                                ? undefined
                                : {
                                    state: {
                                      key: Date.now(),
                                    },
                                  },
                          },
                          [
                            m("span", tab.name),
                            tab.count === undefined || tab.count === 0
                              ? []
                              : m("span.GlobalCount", `${tab.count}`),
                          ],
                        );
                      }),
                    ),
                vnode.attrs.name === undefined &&
                vnode.attrs.buttonLeft === undefined &&
                vnode.attrs.buttonRight === undefined
                  ? []
                  : m("div.Title__header", [
                      vnode.attrs.buttonLeft === undefined &&
                      vnode.attrs.buttonRight === undefined
                        ? []
                        : m("div", [
                            vnode.attrs.buttonLeft === undefined
                              ? []
                              : m(Button, {
                                  ...vnode.attrs.buttonLeft,
                                  ...{
                                    iconOnly:
                                      AppState.getSessionDisplay() <
                                        DisplayEnum.Small ||
                                      vnode.attrs.buttonLeft.iconOnly === true,
                                  },
                                }),
                          ]),
                      vnode.attrs.loaded === false
                        ? m(
                            `div.Title__loading.${Animate.class(Animation.Pulse)}`,
                            m("span"),
                          )
                        : m("span.Title__name", vnode.attrs.name),
                      vnode.attrs.buttonLeft === undefined &&
                      vnode.attrs.buttonRight === undefined
                        ? []
                        : m("div", [
                            vnode.attrs.buttonRight === undefined
                              ? []
                              : m(Button, {
                                  ...vnode.attrs.buttonRight,
                                  ...{
                                    iconOnly:
                                      AppState.getSessionDisplay() <
                                        DisplayEnum.Small ||
                                      vnode.attrs.buttonRight.iconOnly === true,
                                  },
                                }),
                          ]),
                    ]),
              ],
            ),
        vnode.attrs.subtitles === undefined
          ? []
          : m(
              "div.Title__subtitles",
              vnode.attrs.subtitles.map(
                (subtitle: TitleAttrsSubtitle): m.Children => {
                  return m(
                    "p.Title__subtitle",
                    {
                      id: `subtitle${StringToID(subtitle.key)}`,
                      key: subtitle.key,
                    },
                    [
                      m("span.Title__subtitle--key", subtitle.key),
                      vnode.attrs.loaded === false
                        ? m(
                            `span.Title__subtitle--loading.${Animate.class(Animation.Pulse)}`,
                          )
                        : m(
                            "span.Title__subtitle--value",
                            {
                              style: {
                                color: subtitle.color,
                              },
                            },
                            subtitle.value,
                          ),
                    ],
                  );
                },
              ),
            ),
      ];
    },
  };
}
