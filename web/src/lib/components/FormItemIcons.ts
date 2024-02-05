import { AppState } from "@lib/states/App";
import m from "mithril";

import { StringToID } from "../utilities/StringToID";
import type { IconName } from "./Icon";
import { Icon } from "./Icon";
import { Tooltip } from "./Tooltip";

export interface FormItemIconsAttrs {
  /** Is the FormItem disabled? */
  disabled?: boolean;

  /** Icon to use for selected values. */
  iconSelect: IconName;

  /** Icon to use for not values. */
  iconUnselect: IconName;

  /** String to append to ID. */
  idPostfix?: string;

  /** Max number of icons to select from. */
  max: number;

  /** Name of the FormItem. */
  name: string;
  onclick?(e: number): void;

  /** Help tooltip. */
  tooltip: string;

  /** Value of the FormItem. */
  value: number;
}

export function FormItemIcons(): m.Component<FormItemIconsAttrs> {
  return {
    view: (vnode): m.Children => {
      return m("div.FormItem", [
        m("div.FormItem__label", [
          m(
            "label",
            {
              id: `form-item-label${StringToID(vnode.attrs.name)}`,
            },
            vnode.attrs.name,
          ),
          vnode.attrs.disabled === true || vnode.attrs.max === 0
            ? []
            : m(Tooltip, {
                value: vnode.attrs.tooltip,
              }),
        ]),
        m(
          "div.FormItem__field--icons",
          {
            class:
              vnode.attrs.disabled === true || vnode.attrs.max === 0
                ? "FormItem__field--disabled"
                : "FormItem__field",
            id: `form-item-icons${StringToID(vnode.attrs.name)}${StringToID(vnode.attrs.idPostfix)}`,
          },
          Array.from(Array(vnode.attrs.max).keys()).map((item) => {
            if (vnode.attrs.disabled === true && item >= vnode.attrs.value) {
              return [];
            }

            return m(Icon, {
              icon:
                item < vnode.attrs.value
                  ? vnode.attrs.iconSelect
                  : vnode.attrs.iconUnselect,
              onclick: async () => {
                if (
                  vnode.attrs.disabled !== true &&
                  vnode.attrs.onclick !== undefined
                ) {
                  vnode.attrs.onclick(item + 1);
                }
              },
            });
          }),
        ),
        vnode.attrs.disabled === true
          ? []
          : m(
              "div.FormItem__bottom",
              {},
              m(
                "span.FormItem__button",
                {
                  id: `form-item-input-none${StringToID(vnode.attrs.name)}`,
                  onclick: () => {
                    if (
                      vnode.attrs.disabled !== true &&
                      vnode.attrs.onclick !== undefined
                    ) {
                      vnode.attrs.onclick(0);
                    }
                  },
                },
                AppState.data.translations.actionDeselectAll,
              ),
            ),
      ]);
    },
  };
}
