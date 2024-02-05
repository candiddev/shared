import { AppState } from "@lib/states/App";
import m from "mithril";

import { Icons } from "../types/Icons";
import { CSV } from "../utilities/CSV";
import type { ButtonAttrs } from "./Button";
import { Button } from "./Button";
import { Form } from "./Form";
import { FormItemInput } from "./FormItemInput";
import { FormItemSelect } from "./FormItemSelect";
import { Icon } from "./Icon";
import { Tooltip } from "./Tooltip";

export interface FormImportCSVAttrs {
  /** A list of buttons to show within the form. */
  buttons?: ButtonAttrs[];

  /** A list of fields to map the CSV to. */
  fields: {
    [key: string]: string;
  };

  /** Whether to merge the fields with the existing CSV fields. */
  merge?: boolean;
  oninput(field: string, value: string): void;
  onsubmit(csvData: string): Promise<void>;

  /** Title for the form. */
  title: string;
  toggle(visible: boolean): void;

  /** Toggle if the form is visible. */
  visible: boolean;
}

export function FormImportCSV(): m.Component<FormImportCSVAttrs> {
  const state = {
    csv: "",
    headers: [] as string[],
  };

  return {
    view: (vnode): m.Children => {
      return vnode.attrs.visible
        ? m(
            Form,
            {
              buttons: [
                {
                  name: AppState.data.translations.actionCancel,
                  onclick: async (): Promise<void> => {
                    return new Promise((resolve) => {
                      state.csv = "";
                      vnode.attrs.toggle(false);

                      return resolve();
                    });
                  },
                  permitted: true,
                  requireOnline: true,
                },
                {
                  name: AppState.data.translations.actionImport,
                  permitted: state.csv !== "",
                  requireOnline: true,
                  submit: true,
                },
              ],
              onsubmit: async () => {
                return vnode.attrs.onsubmit(state.csv).then(() => {
                  vnode.attrs.toggle(false);
                });
              },
              overlay: true,
              title: {
                name: vnode.attrs.title,
              },
            },
            [
              m(Button, {
                name: AppState.data.translations.formImportCSVSelectCSV,
                oninput: async (file) => {
                  const reader = new FileReader();
                  reader.onload = async (): Promise<void> => {
                    if (typeof reader.result === "string") {
                      state.csv = reader.result;
                      state.headers = await CSV.getHeaders(state.csv);

                      for (const header of state.headers) {
                        if (Object.keys(vnode.attrs.fields).includes(header)) {
                          vnode.attrs.oninput(header, header);
                          m.redraw();

                          continue;
                        } else if (vnode.attrs.merge === true) {
                          vnode.attrs.oninput(header, header);
                        }
                      }

                      m.redraw();
                    }
                  };

                  reader.readAsText(file);
                },
                permitted: state.csv === "",
                primary: true,
                requireOnline: true,
              }),
              vnode.attrs.buttons !== undefined && state.csv === ""
                ? vnode.attrs.buttons.map((button) => {
                    return m(Button, button);
                  })
                : [],
              state.csv === ""
                ? []
                : m(
                    "div.FormItem",
                    {
                      id: "form-item-csv-field-mapping",
                    },
                    [
                      m("div.FormItem__label", [
                        m(
                          "label",
                          {
                            for: "form-item-input-csv-field-mapping",
                            id: "form-item-label-csv-field-mapping",
                          },
                          AppState.data.translations.formImportCSVField,
                        ),
                        m(Tooltip, {
                          value:
                            AppState.data.translations.formImportCSVTooltip,
                        }),
                      ]),
                      Object.keys(vnode.attrs.fields).map((field, index) => {
                        return m(
                          "div.FormItem__multi",
                          {
                            key: index,
                            style: {
                              "flex-wrap": "nowrap",
                            },
                          },
                          [
                            m(FormItemInput, {
                              disabled: true,
                              name: `csv-field-mapping-${field}-name`,
                              type: "text",
                              value: field,
                            }),
                            m(Icon, {
                              icon: Icons.Mapping,
                            }),
                            m(FormItemSelect, {
                              name: `csv-field-mapping-${field}-value`,
                              oninput: (value) => {
                                vnode.attrs.oninput(field, value as string);
                              },
                              options: ["", ...state.headers],
                              value: vnode.attrs.fields[field],
                            }),
                          ],
                        );
                      }),
                    ],
                  ),
            ],
          )
        : [];
    },
  };
}
