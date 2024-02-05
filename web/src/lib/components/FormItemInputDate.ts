import m from "mithril";

import { FormItem } from "./FormItem";

export interface FormItemInputDateAttrs {
  /** Name of the FormItem. */
  name: string;
  oninput(date: string): void;

  /** Is the FormItem required? */
  required?: boolean;

  /** Help tooltip. */
  tooltip: string;

  /** Current value, will be displayed as a Currency. */
  value: NullCivilDate;
}

export function FormItemInputDate(): m.Component<FormItemInputDateAttrs> {
  let dateString = "";

  return {
    oninit: (vnode): void => {
      dateString = vnode.attrs.value === null ? "" : vnode.attrs.value;
    },
    view: (vnode): m.Children => {
      return m(FormItem, {
        input: {
          oninput: (e: string): void => {
            dateString = e;

            vnode.attrs.oninput(e);
          },
          required: vnode.attrs.required === true,
          type: "date",
          value: dateString,
        },
        name: vnode.attrs.name,
        tooltip: vnode.attrs.tooltip,
      });
    },
  };
}
