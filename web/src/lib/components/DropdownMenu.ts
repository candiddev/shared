import "./DropdownMenu.css";

import m from "mithril";

import { AppState } from "../states/App";
import { Animate, Animation } from "../utilities/Animate";
import { SetClass } from "../utilities/SetClass";
import { StringToID } from "../utilities/StringToID";
import type { IconName } from "./Icon";
import { Icon } from "./Icon";
import { Markdown } from "./Markdown";

export interface DropdownMenuAttrs {
  /** Optional class to append to DropdownMenu. */
  class?: string;

  /** ID of the DropdownMenu. */
  id: string;

  /** A list of items to display in the DropdownMenu. */
  items?: DropdownMenuAttrsItem[];
  onclick?(): void;
}

export interface DropdownMenuAttrsItem {
  /** Should the item have header CSS applied? */
  header?: boolean;

  /** Item link. */
  href?: string;

  /** Icon to display in front of name. */
  icon?: IconName;

  /** ID for the item. */
  id?: string;

  /** Name of the item, displayed in menu. */
  name?: string;
  onclick?(): void;

  /** Is the item permitted? */
  permitted: boolean;

  /** Does the item need to be online to work? */
  requireOnline: boolean;
}

export function DropdownMenu(): m.Component<DropdownMenuAttrs> {
  return {
    view: (vnode): m.Children => {
      if (
        vnode.attrs.items === undefined ||
        AppState.getComponentsDropdownMenu() !== vnode.attrs.id
      ) {
        return [];
      }

      return m(
        `ul.DropdownMenu__menu.${Animate.class(Animation.Expand)}${
          vnode.attrs.class === undefined ? "" : vnode.attrs.class
        }`,
        {
          class: SetClass({
            "DropdownMenu__menu--above":
              AppState.getComponentsDropdownMenuAbove(),
          }),
          id: `dropdown${StringToID(vnode.attrs.id)}`,
          onbeforeremove: Animate.onbeforeremove(Animation.Expand),
          onclick: (e: m.Event<MouseEvent>) => {
            e.stopPropagation();

            if (vnode.attrs.onclick !== undefined) {
              vnode.attrs.onclick();
            }
          },
        },
        vnode.attrs.items.map((item) => {
          if (
            item.permitted === false ||
            (item.requireOnline === true && !AppState.isSessionOnline())
          ) {
            return [];
          }

          return m(
            "li",
            {
              class:
                item.header === true ? "DropdownMenu__item--header" : undefined,
            },
            m(
              item.href === undefined
                ? ("p" as any) // eslint-disable-line
                : m.route.Link,
              {
                class: SetClass({
                  DropdownMenu__item: true,
                  "DropdownMenu__item--header": item.header === true,
                }),
                href: item.href,
                id: `dropdown-item${StringToID(
                  item.id === undefined ? item.name : item.id,
                )}`,
                key: item.name,
                onclick: (e: m.Event<MouseEvent>): void => {
                  e.stopPropagation();

                  if (item.onclick !== undefined) {
                    item.onclick();
                  }

                  AppState.setComponentsDropdownMenu("", 0);
                },
                options:
                  item.href === undefined
                    ? undefined
                    : {
                        state: {
                          key: Date.now(),
                        },
                      },
              },
              [
                item.icon === undefined
                  ? []
                  : m(Icon, {
                      icon: item.icon,
                    }),
                m(Markdown, {
                  value: item.name,
                }),
              ],
            ),
          );
        }),
      );
    },
  };
}
