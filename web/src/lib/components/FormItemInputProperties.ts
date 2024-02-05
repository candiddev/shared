import { AppState } from "@lib/states/App";
import { Icons } from "@lib/types/Icons";
import m from "mithril";

import { Button } from "./Button";
import { FormItemInput } from "./FormItemInput";
import { Tooltip } from "./Tooltip";

export interface FormItemInputPropertiesAttrs {
  /** Add a custom button after delete. */
  button?: {
    /** Icon for custom button. */
    icon: string;
    onclick(key: string): void;
  };
  /** Data to modify. */
  data: {
    [key: string]: string | undefined;
  };
  getKey(key: string): string;
  getValue(key: string): string;
  keyOninput(key: string, input: string): void;

  /** A list of values for a property value datalist. */
  keyValues?(key: string): string[];

  /** Ignore keys with this property. */
  ignoreKeys?: string[];

  /** Input name. */
  name: string;

  /** Single name. */
  nameSingle: string;

  /** A list of properties to fill in for the datalist. */
  properties: string[];

  /** Tooltip value. */
  tooltip: string;

  /** Use a monospace font for values. */
  valueMonospace?: boolean;
  valueOninput(key: string, input: string): void;
}

export function FormItemInputProperties(): m.Component<FormItemInputPropertiesAttrs> {
  return {
    view: (vnode): m.Children => {
      return m(
        "div.FormItem",
        {
          id: "form-item-properties",
        },
        [
          m("div.FormItem__label", [
            m(
              "label",
              {
                for: "form-item-input-properties",
                id: "form-item-label-properties",
              },
              vnode.attrs.name,
            ),
            m(Tooltip, {
              value: vnode.attrs.tooltip,
            }),
          ]),
          Object.keys(vnode.attrs.data).map((key, index) => {
            if (
              vnode.attrs.ignoreKeys !== undefined &&
              vnode.attrs.ignoreKeys.includes(key)
            ) {
              return m("p", {
                key: index,
              });
            }

            return m(
              "div.FormItem__multi",
              {
                key: index,
                style: {
                  "flex-wrap": "nowrap",
                },
              },
              [
                m("div.FormItem__multi--vertical", [
                  m(FormItemInput, {
                    bold: true,
                    datalist: vnode.attrs.properties,
                    name: `properties-key-${index}`,
                    oninput: (e) => {
                      vnode.attrs.keyOninput(key, e);
                    },
                    placeholder: "Name",
                    type: "text",
                    value: vnode.attrs.getKey(key),
                  }),
                  m(FormItemInput, {
                    datalist:
                      vnode.attrs.keyValues === undefined
                        ? undefined
                        : vnode.attrs.keyValues(key),
                    monospace: vnode.attrs.valueMonospace,
                    name: `properties-value-${index}`,
                    oninput: (e) => {
                      vnode.attrs.valueOninput(key, e);
                    },
                    placeholder: "Value",
                    type: "text",
                    value: vnode.attrs.getValue(key),
                  }),
                ]),
                m("div.FormItem__multi--vertical", [
                  m(
                    "i.GlobalButtonIconAdd",
                    {
                      id: `button-delete-${index}`,
                      onclick: () => {
                        delete vnode.attrs.data[key];
                      },
                    },
                    Icons.Delete,
                  ),
                  vnode.attrs.button === undefined
                    ? []
                    : m(
                        "i.GlobalButtonIconAdd",
                        {
                          id: `button-custom-${index}`,
                          onclick: () => {
                            vnode.attrs.button?.onclick(key);
                          },
                        },
                        vnode.attrs.button.icon,
                      ),
                ]),
              ],
            );
          }),
          m(Button, {
            name: `${AppState.data.translations.actionAdd} ${vnode.attrs.nameSingle}`,
            onclick: async (): Promise<void> => {
              return new Promise((resolve) => {
                vnode.attrs.data[""] = "";

                return resolve();
              });
            },
            permitted: true,
            requireOnline: true,
          }),
        ],
      );
    },
  };
}
