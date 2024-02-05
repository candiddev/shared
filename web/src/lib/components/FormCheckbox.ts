import "./FormCheckbox.css";

import type { Err } from "@lib/services/Log";
import m from "mithril";

import { StringToID } from "../utilities/StringToID";

export interface FormCheckboxAttrs {
  /** Is the checkbox disabled? */
  disabled?: boolean;

  /** Name of the checkbox, will be on the left side. */
  name: string;
  onclick?(): Promise<void | Err> | void;

  /** Add padding to the top of the checkbox. */
  topPadding?: boolean;

  validator?(e: m.Input): void;

  /** Current value of the checkbox (true/false). */
  value?: boolean | null;
}

export function FormCheckbox(): m.Component<FormCheckboxAttrs> {
  return {
    view: (vnode): m.Children => {
      return m(
        "label.FormCheckbox",
        {
          class:
            vnode.attrs.disabled === true ? undefined : "FormCheckbox--pointer",
          for: `form-checkbox-input${StringToID(vnode.attrs.name)}`,
          id: `form-checkbox-label${StringToID(vnode.attrs.name)}`,
          style: {
            "padding-top":
              vnode.attrs.topPadding === true ? "var(--padding)" : undefined,
          },
        },
        [
          m(
            "span",
            vnode.children === undefined ||
              (Array.isArray(vnode.children) && vnode.children.length === 0)
              ? vnode.attrs.name
              : vnode.children,
          ),
          m("input", {
            checked: vnode.attrs.value,
            id: `form-checkbox-input${StringToID(vnode.attrs.name)}`,
            onclick: async (e: m.Input) => {
              if (vnode.attrs.disabled === true) {
                return;
              }
              if (vnode.attrs.onclick !== undefined) {
                await vnode.attrs.onclick();
              }
              if (vnode.attrs.validator !== undefined) {
                vnode.attrs.validator(e);
              }
            },
            type: "checkbox",
          }),
        ],
      );
    },
  };
}
