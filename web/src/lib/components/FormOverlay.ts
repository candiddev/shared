import type { Err } from "@lib/services/Log";
import { AppState } from "@lib/states/App";
import m from "mithril";

import type { ButtonAttrs } from "../components/Button";
import { Form } from "../components/Form";
import { FormItem } from "../components/FormItem";
import { Timestamp } from "../types/Timestamp";

export interface FormOverlayAttrs<T> {
  /** Buttons to show along with regular FormOverlay buttons. */
  buttons: ButtonAttrs[];

  /** Data to use with the FormItems. */
  data: T;

  /** Is the form loaded? */
  loaded?: boolean;

  /** Name of the FormOverlay. */
  name: string;
  onDelete(): Promise<void | Err>;
  onSubmit(): Promise<T | void | Err>;

  /** Is the FormOverlay permitted? */
  permitted: boolean;
}

export interface FormOverlayComponentAttrs<T> {
  /** Data passed to the component. */
  data: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FormOverlay(): m.Component<FormOverlayAttrs<any>> {
  let deleteConfirm = false;

  return {
    oninit: (): void => {
      deleteConfirm = false;
    },
    view: (vnode): m.Children => {
      return AppState.getLayoutAppForm().component === null &&
        process.env.NODE_ENV !== "test"
        ? null
        : m(
            Form,
            {
              buttons: [
                ...vnode.attrs.buttons,
                ...[
                  {
                    accent: true,
                    name: AppState.data.translations.actionDelete,
                    onclick: async (): Promise<void> => {
                      return new Promise((resolve) => {
                        deleteConfirm = true;

                        return resolve();
                      });
                    },
                    permitted:
                      vnode.attrs.data.id !== null &&
                      !deleteConfirm &&
                      vnode.attrs.permitted,
                    requireOnline: true,
                  },
                  {
                    name: AppState.data.translations.actionCancel,
                    onclick: async (): Promise<void> => {
                      return new Promise((resolve) => {
                        if (deleteConfirm) {
                          deleteConfirm = false;

                          return resolve();
                        }

                        AppState.setLayoutAppForm();
                        return resolve();
                      });
                    },
                    permitted: true,
                    requireOnline: true,
                  },
                  {
                    name:
                      vnode.attrs.data.id === null
                        ? AppState.data.translations.actionAdd
                        : AppState.data.translations.actionUpdate,
                    permitted: !deleteConfirm && vnode.attrs.permitted,
                    requireOnline: true,
                    submit: true,
                  },
                  {
                    accent: true,
                    name: AppState.data.translations.actionDeleteConfirm,
                    onclick: async (): Promise<void> => {
                      return vnode.attrs.onDelete().then(async () => {
                        deleteConfirm = false;
                        AppState.setLayoutAppForm();
                      });
                    },
                    permitted: deleteConfirm && vnode.attrs.permitted,
                    requireOnline: true,
                  },
                ],
              ],
              loaded: vnode.attrs.loaded,
              onsubmit: async () => {
                return vnode.attrs
                  .onSubmit()
                  .then(() => {
                    AppState.setLayoutAppForm();
                    AppState.setComponentsButtonLoading("");
                    m.redraw();
                  })
                  .catch(() => {
                    AppState.setComponentsButtonLoading("");
                  });
              },
              overlay: true,
              title: {
                name: `${
                  vnode.attrs.data.id === null
                    ? AppState.data.translations.actionNew
                    : AppState.data.translations.actionUpdate
                } ${vnode.attrs.name}`,
              },
            },
            [
              vnode.children,
              vnode.attrs.data.created === undefined ||
              vnode.attrs.data.created === null
                ? []
                : m(FormItem, {
                    input: {
                      disabled: true,
                      oninput: () => {},
                      type: "date",
                      value: Timestamp.fromString(
                        vnode.attrs.data.created,
                      ).toPrettyString(
                        AppState.preferences().formatDateOrder,
                        AppState.preferences().formatDateSeparator,
                        AppState.preferences().formatTime24,
                      ),
                    },
                    name: AppState.data.translations.formCreated,
                    tooltip: "",
                  }),
              vnode.attrs.data.updated === undefined ||
              vnode.attrs.data.updated === null
                ? []
                : m(FormItem, {
                    input: {
                      disabled: true,
                      oninput: () => {},
                      type: "date",
                      value: Timestamp.fromString(
                        vnode.attrs.data.updated,
                      ).toPrettyString(
                        AppState.preferences().formatDateOrder,
                        AppState.preferences().formatDateSeparator,
                        AppState.preferences().formatTime24,
                      ),
                    },
                    name: AppState.data.translations.formLastUpdated,
                    tooltip: "",
                  }),
            ],
          );
    },
  };
}
