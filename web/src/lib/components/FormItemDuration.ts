import { AppState } from "@lib/states/App";
import m from "mithril";

import { StringToID } from "../utilities/StringToID";
import { FormItemInput } from "./FormItemInput";
import { Tooltip } from "./Tooltip";

export interface FormItemDurationAttrs {
  /** Is the FormItem disabled? */
  disabled?: boolean;
  getDuration(): number;

  /** Name of the FormItem. */
  name: string;
  setDuration(duration: number): void;

  /** Help tooltip. */
  tooltip: string;
}

export function FormItemDuration(): m.Component<FormItemDurationAttrs> {
  function getHour(duration: number): number {
    return Math.floor(duration / 60);
  }

  function getMinute(duration: number): number {
    return duration - Math.floor(duration / 60) * 60;
  }

  return {
    view: (vnode): m.Children => {
      return m("div.FormItem", [
        m("div.FormItem__label", [
          m(
            "label",
            {
              for: `form-item-input${StringToID(vnode.attrs.name)}`,
              id: `form-item-label${StringToID(vnode.attrs.name)}`,
            },
            vnode.attrs.name,
          ),
          vnode.attrs.disabled === true
            ? []
            : m(Tooltip, {
                value: vnode.attrs.tooltip,
              }),
        ]),
        m(
          "div.FormItem__multi",
          {
            class:
              vnode.attrs.disabled === true
                ? "FormItem__multi--disabled"
                : undefined,
            id: `form-item-multi${StringToID(vnode.attrs.name)}`,
          },
          [
            m(FormItemInput, {
              disabled: vnode.attrs.disabled,
              min: 0,
              name: "hour",
              oninput: (e) => {
                let v = 0;
                if (e !== "") {
                  v = parseInt(e, 10);
                }

                if (v < 0) {
                  v = 0;
                }

                vnode.attrs.setDuration(
                  vnode.attrs.getDuration() -
                    getHour(vnode.attrs.getDuration()) * 60 +
                    v * 60,
                );
              },
              type: "number",
              value: getHour(vnode.attrs.getDuration()),
            }),
            m(
              "span",
              getHour(vnode.attrs.getDuration()) === 1
                ? AppState.data.translations.formItemDurationHour
                : AppState.data.translations.formItemDurationHours,
            ),
            m(FormItemInput, {
              disabled: vnode.attrs.disabled,
              min: 0,
              name: "minutes",
              oninput: (e) => {
                let v = 0;
                if (e !== "") {
                  v = parseInt(e, 10);
                }

                if (v < 0) {
                  v = 0;
                }

                vnode.attrs.setDuration(
                  vnode.attrs.getDuration() -
                    getMinute(vnode.attrs.getDuration()) +
                    v,
                );
              },
              type: "number",
              value: getMinute(vnode.attrs.getDuration()),
            }),
            m(
              "span",
              getMinute(vnode.attrs.getDuration()) === 1
                ? AppState.data.translations.formItemDurationMinute
                : AppState.data.translations.formItemDurationMinutes,
            ),
          ],
        ),
      ]);
    },
  };
}
