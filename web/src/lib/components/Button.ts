import "./Button.css";

import m from "mithril";

import type { Err } from "../services/Log";
import { IsErr, NewErr } from "../services/Log";
import { AppState } from "../states/App";
import { Icons } from "../types/Icons";
import { Animate, Animation } from "../utilities/Animate";
import { SetClass } from "../utilities/SetClass";
import { StringToID } from "../utilities/StringToID";
import type { IconName } from "./Icon";
import { Icon } from "./Icon";

export interface ButtonAttrs {
  /** Color button with accent. */
  accent?: boolean;

  /** Accept a certain kind of input/file for oninput. */
  accept?: string;

  /** Disable button from being clicked. */
  disabled?: boolean;

  /** Download URL for button to send files from. */
  download?: string;

  /** Used when Button is actually a label. */
  for?: string;

  /** Make button a link. */
  href?: string;

  /** Add an Icon to the button. */
  icon?: IconName;

  /** Only show the icon. */
  iconOnly?: boolean;

  /** Have the icon be on the right. */
  iconRight?: boolean;

  /** Have the icon be on top. */
  iconTop?: boolean;

  /** Custom ID for the button. */
  id?: string;

  /** Text to put inside the button. */
  name: string;

  onclick?(): Promise<void | Err>;
  oninput?(file: File): Promise<void> | void;

  /** An object of m.route.Link options. */
  options?: {};

  /** Show/hide the button based on permissions. */
  permitted: boolean;

  /** Color button with primary. */
  primary?: boolean;

  /** Does the button only work when online? */
  requireOnline: boolean;

  /** Color button with secondary. */
  secondary?: boolean;

  /** Does the button submit a form? */
  submit?: boolean;

  /** Href target, typically _blank if necessary. */
  target?: string;
}

export function Button(): m.Component<ButtonAttrs> {
  return {
    view: (vnode): m.Children => {
      if (vnode.attrs.permitted === false) {
        return null;
      }

      if (vnode.attrs.requireOnline && !AppState.isSessionOnline()) {
        return null;
      }

      let id: string;

      if (vnode.attrs.id === undefined) {
        id = `button${StringToID(vnode.attrs.name)}`;
      } else {
        id = `${vnode.attrs.id}`;
      }

      const c = SetClass({
        Button: true,
        "Button--accent": vnode.attrs.accent === true,
        "Button--icon": vnode.attrs.iconOnly === true,
        "Button--icon-top": vnode.attrs.iconTop === true,
        "Button--primary":
          vnode.attrs.submit === true || vnode.attrs.primary === true,
        "Button--secondary": vnode.attrs.secondary === true,
      });

      if (vnode.attrs.download !== undefined) {
        return m(
          "a",
          {
            class: c,
            download: vnode.attrs.download,
            href: vnode.attrs.href,
            id: id,
            options: vnode.attrs.options,
          },
          vnode.attrs.name,
        );
      } else if (vnode.attrs.oninput !== undefined) {
        return m(
          "label",
          {
            class: c,
            id: id,
          },
          [
            m("input", {
              accept: vnode.attrs.accept,
              oninput: async (e: m.Input) => {
                const files = e.target.files;
                if (files === null || vnode.attrs.oninput === undefined) {
                  return;
                }

                return vnode.attrs.oninput(files[0]);
              },
              type: "file",
            }),
            vnode.attrs.name,
          ],
        );
      } else if (vnode.attrs.for !== undefined) {
        return m(
          "label.Button",
          {
            class: c,
            for: vnode.attrs.for,
            id: id,
          },
          vnode.attrs.name,
        );
      } else if (
        (vnode.attrs.onclick !== undefined && vnode.attrs.href === undefined) ||
        vnode.attrs.submit === true
      ) {
        return m(
          "button",
          {
            class: c,
            disabled:
              vnode.attrs.disabled === true ||
              AppState.getComponentsButtonLoading() === id,
            id: id,
            onclick: async (e: m.Event<MouseEvent>) => {
              if (vnode.attrs.submit === true) {
                // Check if form is valid to avoid spinning button for no reason
                const form = e.target.closest("form");
                if (form === null || form.checkValidity()) {
                  // eslint-disable-line @typescript-eslint/no-non-null-assertion
                  AppState.setComponentsButtonLoading(id);
                }
              }

              if (vnode.attrs.onclick !== undefined) {
                e.stopPropagation();
                AppState.setComponentsButtonLoading(id);

                return vnode.attrs
                  .onclick()
                  .then((err) => {
                    if (IsErr(err)) {
                      AppState.setLayoutAppAlert({
                        message: err.message,
                      });
                    }

                    AppState.setComponentsButtonLoading("");

                    m.redraw.sync();
                  })
                  .catch((err) => {
                    NewErr(err);

                    AppState.setComponentsButtonLoading("");

                    m.redraw.sync();
                  });
              }
            },
            type: vnode.attrs.submit === true ? "submit" : "button",
          },
          [
            vnode.attrs.icon !== undefined && vnode.attrs.iconRight !== true
              ? m(Icon, {
                  icon: vnode.attrs.icon,
                })
              : [],
            vnode.attrs.iconOnly === true ? [] : vnode.attrs.name,
            vnode.attrs.icon !== undefined && vnode.attrs.iconRight === true
              ? m(Icon, {
                  classes: "Button__icon--right",
                  icon: vnode.attrs.icon,
                })
              : [],
            AppState.getComponentsButtonLoading() === id
              ? m(
                  `button.Button.Button--loading.${Animate.class(Animation.Fade)}`,
                  {
                    class: c,
                    onbeforeremove: Animate.onbeforeremove(Animation.Fade),
                  },
                  m(Icon, {
                    classes: "animationSpinAdd",
                    icon: Icons.Loading,
                  }),
                )
              : [],
          ],
        );
      } else if (vnode.attrs.href !== undefined) {
        return m(
          m.route.Link,
          {
            class: c,
            href: vnode.attrs.href,
            id: id,
            onclick: vnode.attrs.onclick,
            options: {
              ...vnode.attrs.options,
              ...{
                state: {
                  key: Date.now(),
                },
              },
            },
            target: vnode.attrs.target,
          },
          [
            vnode.attrs.icon !== undefined && vnode.attrs.iconRight !== true
              ? m(Icon, {
                  icon: vnode.attrs.icon,
                })
              : [],
            vnode.attrs.iconOnly === true ? [] : vnode.attrs.name,
            vnode.attrs.icon !== undefined && vnode.attrs.iconRight === true
              ? m("i.Button__icon--right", vnode.attrs.icon)
              : [],
          ],
        );
      }
      return [];
    },
  };
}
