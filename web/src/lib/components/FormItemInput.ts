import "./FormItem.css";

import m from "mithril";

import { StringToID } from "../utilities/StringToID";
import { ButtonArray } from "./ButtonArray";
import type { IconName } from "./Icon";
import { Markdown } from "./Markdown";

export interface FormItemInputAttrs {
  /** Autocomplete value for input element. */
  autocomplete?: string;

  /** Make input value bold. */
  bold?: boolean;

  /** Datalist to create and associate with input element. */
  datalist?: string[];

  /** Is the FormItem disabled? */
  disabled?: boolean;
  formatter?(e: string): string;

  /** Is the input element hidden? */
  hidden?: boolean;

  /** Icon to use for ButtonArray, if the FormItem Value is an array. */
  icon?: IconName;

  /** Changes the inputmode to limit the available number of characters. */
  inputmode?: string;

  /** Is Markdown support enabled for this input? */
  markdown?: boolean;

  /** Max value for the input element. */
  max?: number;

  /** Min value for the input element. */
  min?: number;

  /** Use a monospace font for input. */
  monospace?: boolean;

  /** Name of the FormItem, used for the ID. */
  name?: string;
  onfocus?(): void;
  onfocusout?(): void;
  oninput?(value: string): void;

  /** Only accept entries from the datalist. */
  onlyDatalist?: boolean;
  onremove?(): void;

  /** Pattern to set/match for the input element. */
  pattern?: string;

  /** Placeholder text for the input element. */
  placeholder?: number | string;

  /** Is the input element required? */
  required?: boolean;

  /** Type to set for the input element. */
  type: string;
  validator?(e: m.Input): void;

  /** Value of the input element.  If this is an Array, will render a ButtonArray. */
  value?: number | string | string[] | null;

  /** LinkPrefix for the ButtonArray. */
  valueLinkPrefix?: string;
}

export function FormItemInput(): m.Component<FormItemInputAttrs> {
  const state = {
    timer: 0,
    value: "",
  };

  return {
    view: (vnode): m.Children => {
      return [
        Array.isArray(vnode.attrs.value)
          ? m(ButtonArray, {
              icon: vnode.attrs.icon,
              name: vnode.attrs.name,
              value: vnode.attrs.value,
              valueLinkPrefix:
                vnode.attrs.disabled === true
                  ? vnode.attrs.valueLinkPrefix
                  : undefined,
            })
          : [],
        vnode.attrs.disabled === true
          ? m(
              "div.FormItem__disabled",
              {
                id: `form-item-input${StringToID(vnode.attrs.name)}`,
                style: {
                  "font-family":
                    vnode.attrs.monospace === true ? "monospace" : undefined,
                },
              },
              Array.isArray(vnode.attrs.value)
                ? []
                : vnode.attrs.markdown === true
                  ? m(Markdown, {
                      value: vnode.attrs.value,
                    })
                  : vnode.attrs.value,
            )
          : [
              m("input.FormItem__field", {
                autocomplete:
                  vnode.attrs.autocomplete === undefined
                    ? "off"
                    : vnode.attrs.autocomplete,
                hidden: vnode.attrs.hidden,
                id: `form-item-input${StringToID(vnode.attrs.name)}`,
                inputmode: vnode.attrs.inputmode,
                list:
                  vnode.attrs.datalist === undefined
                    ? undefined
                    : `form-item-datalist${StringToID(vnode.attrs.name)}`,
                max: vnode.attrs.max,
                min: vnode.attrs.min,
                onclick: (e: m.Event<MouseEvent>) => {
                  e.stopPropagation();
                },
                onfocus: async (e: m.Input): Promise<void> => {
                  if (e.target.showPicker !== undefined) {
                    e.target.showPicker();
                  }

                  if (vnode.attrs.onfocus !== undefined) {
                    return vnode.attrs.onfocus();
                  }
                },
                onfocusout: async (): Promise<void> => {
                  if (vnode.attrs.onfocusout !== undefined) {
                    return vnode.attrs.onfocusout();
                  }
                },
                oninput: (e: m.Input) => {
                  if (vnode.attrs.oninput !== undefined) {
                    if (vnode.attrs.formatter !== undefined) {
                      clearTimeout(state.timer);
                      state.timer = window.setTimeout(() => {
                        let v = e.target.value;
                        if (vnode.attrs.formatter !== undefined) {
                          v = vnode.attrs.formatter(e.target.value);
                        }
                        vnode.attrs.oninput!(v); // eslint-disable-line @typescript-eslint/no-non-null-assertion
                        m.redraw();
                      }, 500);
                    }

                    vnode.attrs.oninput(e.target.value);

                    if (vnode.attrs.validator !== undefined) {
                      vnode.attrs.validator(e);
                    }
                  }

                  if (Array.isArray(vnode.attrs.value)) {
                    if (
                      vnode.attrs.datalist !== undefined &&
                      vnode.attrs.onlyDatalist === true
                    ) {
                      if (
                        vnode.attrs.datalist.includes(
                          e.target.value.toLowerCase(),
                        )
                      ) {
                        vnode.attrs.value.push(e.target.value.toLowerCase());
                        state.value = "";

                        return;
                      }
                    } else if (e.target.value.includes(" ")) {
                      vnode.attrs.value.push(
                        e.target.value.split(" ")[0].toLowerCase(),
                      );
                      state.value = "";

                      return;
                    } else if (vnode.attrs.datalist !== undefined) {
                      clearTimeout(state.timer);
                      state.timer = window.setTimeout(() => {
                        if (
                          Array.isArray(vnode.attrs.value) &&
                          vnode.attrs.datalist !== undefined &&
                          vnode.attrs.datalist.includes(
                            e.target.value.toLowerCase(),
                          )
                        ) {
                          vnode.attrs.value.push(e.target.value.toLowerCase());
                          state.value = "";
                        }
                        m.redraw();
                      }, 500);
                    }

                    state.value = e.target.value;
                  }
                },
                pattern: vnode.attrs.pattern,
                placeholder: vnode.attrs.placeholder,
                required: vnode.attrs.required,
                style: {
                  "font-family":
                    vnode.attrs.monospace === true ? "monospace" : undefined,
                  "font-weight":
                    vnode.attrs.bold === true
                      ? "var(--font-weight_bold)"
                      : undefined,
                },
                type:
                  vnode.attrs.datalist === undefined
                    ? vnode.attrs.type === "range"
                      ? "number"
                      : vnode.attrs.type
                    : "text",
                value: Array.isArray(vnode.attrs.value)
                  ? state.value
                  : `${vnode.attrs.value}`.replace(/\\"/g, '"'),
              }),
              vnode.attrs.type === "range"
                ? m("input.FormItem__field", {
                    id: `form-item-input${StringToID(vnode.attrs.name)}-range`,
                    max: vnode.attrs.max,
                    min: vnode.attrs.min,
                    oninput: (e: m.Input) => {
                      if (vnode.attrs.oninput !== undefined) {
                        vnode.attrs.oninput(e.target.value);
                      }
                    },
                    type: "range",
                    value: vnode.attrs.value,
                  })
                : [],
            ],
        vnode.attrs.datalist === undefined
          ? []
          : m(
              "datalist",
              {
                id: `form-item-datalist${StringToID(vnode.attrs.name)}`,
              },
              vnode.attrs.datalist.map((option: string) => {
                return m("option", {
                  value: option,
                });
              }),
            ),
      ];
    },
  };
}
