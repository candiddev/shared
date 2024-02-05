import "./Toolbar.css";

import m from "mithril";

import type { ButtonAttrs } from "./Button";
import { Button } from "./Button";
import type { ButtonArrayAttrs } from "./ButtonArray";
import { FormItem } from "./FormItem";

export interface ToolbarAttrs {
  /** Actions to display within this Toolbar. */
  actions: ButtonAttrs[];
  /** Filters to display within this Toolbar. */
  filters: ButtonArrayAttrs[];
}

export function Toolbar(): m.Component<ToolbarAttrs> {
  return {
    view: (vnode): m.Children => {
      return vnode.attrs.filters.length === 0 &&
        vnode.attrs.actions.length === 0
        ? []
        : m("div.Toolbar", [
            vnode.attrs.filters.length === 0
              ? []
              : vnode.attrs.filters.map((filter) => {
                  return m(FormItem, {
                    buttonArray: filter,
                    name: filter.name === undefined ? "" : filter.name,
                    tooltip: "",
                  });
                }),
            vnode.attrs.actions.length === 0
              ? []
              : m(
                  "div.Toolbar__buttons",
                  vnode.attrs.actions.map((action) => {
                    return m(Button, action);
                  }),
                ),
          ]);
    },
  };
}
