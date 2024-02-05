import "./FormItemInputSearch.css";

import { Icons } from "@lib/types/Icons";
import m from "mithril";

import { StringToID } from "../utilities/StringToID";
import type { FormItemInputAttrs } from "./FormItemInput";
import { FormItemInput } from "./FormItemInput";
import { Icon } from "./Icon";

export function FormItemInputSearch(): m.Component<FormItemInputAttrs> {
  return {
    view: (vnode): m.Children => {
      return m(
        "div.FormItemInputSearch",
        {
          id: `form-item-input-search${StringToID(vnode.attrs.name)}`,
        },
        [
          m(Icon, {
            icon: Icons.Search,
          }),
          m(FormItemInput, vnode.attrs),
          vnode.children,
        ],
      );
    },
  };
}
