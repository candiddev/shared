import { FormCheckbox } from "@lib/components/FormCheckbox";
import { FormItem } from "@lib/components/FormItem";
import { AppState } from "@lib/states/App";
import m from "mithril";

export interface FormItemNewPasswordAttrs {
  /** Replace password with this name. */
  name?: string;

  /** Disable autocomplete fields. */
  noAutocomplete?: boolean;

  /** Disable confirmation field. */
  noConfirm?: boolean;

  /** Don't show New. */
  noNew?: boolean;

  oninput(p: string): void;
  value(): string;
}

export function FormItemNewPassword(): m.Component<FormItemNewPasswordAttrs> {
  const state = {
    password: "",
    visible: false,
  };

  return {
    view: (vnode): m.Children => {
      const name =
        vnode.attrs.name === undefined
          ? AppState.data.translations.formItemNewPasswordPassword
          : vnode.attrs.name;
      const n =
        vnode.attrs.noNew === true
          ? ""
          : `${AppState.data.translations.actionNew} `;

      return [
        m(FormItem, {
          input: {
            autocomplete:
              vnode.attrs.noAutocomplete === true ? undefined : "new-password",
            oninput: (e: string): void => {
              state.password = e;

              if (vnode.attrs.noConfirm === true) {
                vnode.attrs.oninput(e);
              }
            },
            required: true,
            type: state.visible ? "text" : "password",
            value: state.password,
          },
          name: `${n}${name}`,
          tooltip: AppState.data.translations.formItemNewPasswordTooltip,
        }),
        vnode.attrs.noConfirm === true
          ? []
          : m(FormItem, {
              input: {
                autocomplete:
                  vnode.attrs.noAutocomplete === true
                    ? undefined
                    : "new-password",
                oninput: vnode.attrs.oninput,
                type: state.visible ? "text" : "password",
                validator: (e: m.Input): void => {
                  if (state.password === vnode.attrs.value()) {
                    e.target.setCustomValidity("");
                  } else {
                    e.target.setCustomValidity(`${name}s do not match`);
                  }
                },
                value: vnode.attrs.value(),
              },
              name: `${AppState.data.translations.actionConfirm} ${n}${name}`,
              tooltip: AppState.data.translations.formItemNewPasswordTooltip,
            }),
        m(FormCheckbox, {
          name: `${AppState.data.translations.actionShow} ${name}`,
          onclick: () => {
            state.visible = !state.visible;
          },
          value: state.visible,
        }),
      ];
    },
  };
}
