import "./FormExpander.css";

import m from "mithril";

import { Icons } from "../types/Icons";
import { StringToID } from "../utilities/StringToID";

export interface FormExpanderAttrs {
  /** Is the FormExpander expanded? */
  expand: boolean;

  /** Name of the FormExpander, will show on the left side. */
  name: string;
  onclick(): void;
}

export function FormExpander(): m.Component<FormExpanderAttrs> {
  return {
    view: (vnode): m.Children => {
      return m(
        "div.FormExpander",
        {
          class: vnode.attrs.expand ? "FormExpander--expanded" : undefined,
          id: `form-expander${StringToID(vnode.attrs.name)}`,
          onclick: vnode.attrs.onclick,
        },
        [
          m("p", vnode.attrs.name),
          m(
            `i.GlobalButtonIconExpand.${
              vnode.attrs.expand ? "GlobalButtonIconExpand--active" : ""
            }`,
            Icons.Expand,
          ),
        ],
      );
    },
  };
}
