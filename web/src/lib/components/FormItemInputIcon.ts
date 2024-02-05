import { AppState } from "@lib/states/App";
import m from "mithril";

import { MaterialIcons } from "../types/MaterialIcons";
import { FormItem } from "./FormItem";

export interface FormItemInputIconAttrs {
  oninput(value: string): void;

  /** Value of the FormItem. */
  value: string;
}

export function FormItemInputIcon(): m.Component<FormItemInputIconAttrs> {
  return {
    view: (vnode): m.Children => {
      return m(FormItem, {
        input: {
          datalist: MaterialIcons,
          oninput: (e: string): void => {
            vnode.attrs.oninput(e);
          },
          type: "text",
          value: vnode.attrs.value,
        },
        name: AppState.data.translations.formItemInputIconName,
        tooltip: `${AppState.data.translations.formItemInputIconTooltip} [Google Fonts](https://fonts.google.com/icons?selected=Material)`,
      });
    },
  };
}
