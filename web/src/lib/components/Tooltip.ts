import "./Tooltip.css";

import { AppState } from "@lib/states/App";
import m from "mithril";

import { Icons } from "../types/Icons";
import type { IconName } from "./Icon";
import { Icon } from "./Icon";
import { Markdown } from "./Markdown";

export interface TooltipAttrs {
  /** Icon to use for this Tooltip. */
  icon?: IconName;

  /** Is this a Markdown tooltip? */
  markdown?: boolean;

  /** Value to display in the Tooltip. */
  value?: string;
}

export function Tooltip(): m.Component<TooltipAttrs> {
  return {
    view: (vnode): m.Children => {
      return m("div.Tooltips", [
        vnode.attrs.value === undefined
          ? []
          : m("div.Tooltips__tooltip", [
              m(Icon, {
                classes: "Tooltips__info",
                icon:
                  vnode.attrs.icon === undefined
                    ? Icons.Help
                    : vnode.attrs.icon,
              }),
              m(
                "div.Tooltips__text",
                m(Markdown, {
                  value: vnode.attrs.value,
                }),
              ),
            ]),
        vnode.attrs.markdown === true
          ? m("div.Tooltips__tooltip", [
              m("div.Tooltips__tooltip--markdown", [
                "M",
                m(Icon, {
                  icon: Icons.SortDescending,
                }),
              ]),
              m(
                "div.Tooltips__text",
                m(Markdown, {
                  value: `[${AppState.data.translations.tooltipMarkdown}](/help/markdown)`,
                }),
              ),
            ])
          : [],
      ]);
    },
  };
}
