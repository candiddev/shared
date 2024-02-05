import type { IconName } from "@lib/components/Icon";
import { Icon } from "@lib/components/Icon";
import m from "mithril";
import type Stream from "mithril/stream";

import { AppState } from "../states/App";
import { DisplayEnum } from "../types/Display";
import { Icons } from "../types/Icons";
import { StringToID } from "../utilities/StringToID";

export interface AppMenuComponentViewItem {
  [key: string]: boolean | null | number | string | undefined;

  /** An icon to display next to the item. */
  icon?: IconName;

  /** A specific ID for the item. */
  id?: NullUUID;

  /** A custom link for the item. */
  link?: string;

  /** The name of the item. */
  name: string;
}

export interface AppMenuComponentViewAttrs {
  /** The parent component name, lowercase. */
  cLower: string;
  colorFormatter?(m: AppMenuComponentViewItem): string | undefined;
  countFormatter?(m: AppMenuComponentViewItem): string;

  /** A list of items to render under the view. */
  items: Stream<AppMenuComponentViewItem[]>;

  /** Icon to use for every item. */
  itemsIcon?: IconName;
  itemsIconFormatter?(m: AppMenuComponentViewItem): IconName;

  /** Use the ID of the view item when constructing links instead of name. */
  itemsUseID?: boolean;

  /** Query key to append to the constructed link. */
  query?: string;

  /** The parent view name, lowercase. */
  vLower: string;

  /** The full route for the view. */
  vroute: string;
}

export function AppMenuComponentView(): m.Component<AppMenuComponentViewAttrs> {
  return {
    view: (vnode): m.Children => {
      return m(
        "ul.AppMenu__menu.AppMenu__menu--view",
        {
          class:
            AppState.getLayoutAppMenuPath().includes(
              `${vnode.attrs.cLower}/${vnode.attrs.vLower}`,
            ) ||
            (vnode.attrs.items !== undefined &&
              AppState.getLayoutAppMenuPath().startsWith(
                `/${vnode.attrs.cLower}`,
              ))
              ? "AppMenu__menu--open"
              : undefined,
        },
        [
          vnode.attrs.items().map((i: AppMenuComponentViewItem): m.Children => {
            let iroute = vnode.attrs.vroute;

            if (i.link !== undefined) {
              iroute = i.link;
            } else if (vnode.attrs.itemsUseID === true) {
              iroute += `/${i.id}`;
            } else {
              iroute += `${vnode.attrs.query}=${
                i.id === undefined ? i.name : i.id
              }`;
            }

            let count = "0";

            if (vnode.attrs.countFormatter !== undefined) {
              count = vnode.attrs.countFormatter(i);
            }

            const icon =
              vnode.attrs.itemsIconFormatter === undefined
                ? vnode.attrs.itemsIcon === undefined
                  ? i.icon === undefined
                    ? Icons.Tag
                    : i.icon
                  : vnode.attrs.itemsIcon
                : vnode.attrs.itemsIconFormatter(i);

            return m(
              "li.AppMenu__entry.AppMenu__entry--text",
              {
                class: m.route.get().includes(iroute)
                  ? "AppMenu__entry--active"
                  : undefined,
              },
              m(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                iroute.startsWith("/") ? m.route.Link : ("a" as any),
                {
                  href: iroute,
                  id: `app-menu-item-${vnode.attrs.vLower}${StringToID(i.name)}`,
                  key: i.name,
                  onclick: () => {
                    if (AppState.getSessionDisplay() !== DisplayEnum.XLarge) {
                      AppState.toggleLayoutAppMenuOpen(false);
                    }
                  },
                  options: iroute.startsWith("/")
                    ? {
                        state: {
                          key: Date.now(),
                        },
                      }
                    : undefined,
                  target: iroute.startsWith("/") ? undefined : "_blank",
                },
                [
                  icon.startsWith("http")
                    ? m("img.AppMenu__img", {
                        src: icon,
                      })
                    : m(Icon, {
                        icon: icon,
                      }),
                  m("span.AppMenu__entry--text", i.name),
                  vnode.attrs.colorFormatter === undefined
                    ? count === "0"
                      ? []
                      : m("span.GlobalCount", count)
                    : m(
                        "span",
                        {
                          style: {
                            color: vnode.attrs.colorFormatter(i),
                            "font-weight": "var(--font-weight-bold)",
                            "margin-left": "auto",
                            "padding-left": "10px",
                          },
                        },
                        count === "0" ? "" : count,
                      ),
                ],
              ),
            );
          }),
        ],
      );
    },
  };
}
