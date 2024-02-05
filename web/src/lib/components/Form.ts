import "./Form.css";

import type { Err } from "@lib/services/Log";
import m from "mithril";

import { AppState } from "../states/App";
import { Timestamp } from "../types/Timestamp";
import { Animate, Animation } from "../utilities/Animate";
import { SetClass } from "../utilities/SetClass";
import { StringToID } from "../utilities/StringToID";
import type { ButtonAttrs } from "./Button";
import { Button } from "./Button";
import { FormLoading } from "./FormLoading";
import type { TitleAttrs } from "./Title";
import { Title } from "./Title";

export interface FormAttrs {
  /** A list of optional buttons to display below form. */
  buttons?: (ButtonAttrs | null)[];

  /** Should the form be centered in the screen? */
  center?: boolean;

  /** Additional classes to add to Form. */
  classes?: string[];

  /** Should the form always be full width? */
  forceWide?: boolean;

  /** Last modified date to display at the bottom of form. */
  lastModified?: NullTimestamp;

  /** Is the form loaded?  Otherwise will show placeholder form. */
  loaded?: boolean;
  onsubmit?(): Promise<void | Err>;

  /** Is the form an overlay that displays on the right side? */
  overlay?: boolean;

  /** Does the form track progress?  What is the current index? */
  progressCurrent?: number;

  /** Progress steps that a form will go through. */
  progressSteps?: {
    /** Is the step disabled/not displayed? */
    disabled?: boolean;

    /** A link for the step to redirect to when clicked. */
    link: string;

    /** The name of the progress step. */
    name: string;
  }[];

  /** Title to display above form. */
  title?: TitleAttrs;

  /** Whether to flex-wrap items within the form. */
  wrap?: boolean;
}

export function Form(): m.Component<FormAttrs> {
  return {
    onbeforeremove: async (v): Promise<void> => {
      return Animate.onbeforeremove(
        v.attrs.overlay === true ? Animation.FromRight : Animation.Fade,
      )(v);
    },
    onremove: (): void => {
      AppState.setComponentsButtonLoading("");
    },
    view: (vnode): m.Children => {
      return vnode.attrs.overlay === true && !AppState.isSessionOnline()
        ? []
        : m(
            `form.Form.${Animate.class(
              vnode.attrs.overlay === true
                ? Animation.FromRight
                : Animation.Fade,
            )}${
              vnode.attrs.classes === undefined
                ? ""
                : `.${vnode.attrs.classes.join(".")}`
            }`,
            {
              class: SetClass({
                "Form--center": vnode.attrs.center === true,
                "Form--overlay": vnode.attrs.overlay === true,
                "Form--wide":
                  vnode.attrs.wrap === true || vnode.attrs.forceWide === true,
                "Form--wrap": vnode.attrs.wrap === true,
              }),
              id: `form${
                vnode.attrs.title === undefined
                  ? ""
                  : StringToID(vnode.attrs.title.name)
              }`,
              onsubmit: async (e: Event) => {
                e.preventDefault();

                if (vnode.attrs.onsubmit !== undefined) {
                  return vnode.attrs
                    .onsubmit()
                    .then(() => {
                      AppState.setComponentsButtonLoading("");

                      m.redraw.sync();
                    })
                    .catch((err) => {
                      AppState.setComponentsButtonLoading("");
                      AppState.setLayoutAppAlert({
                        message: err.message,
                      });

                      m.redraw.sync();
                    });
                }
              },
            },
            [
              vnode.attrs.title === undefined
                ? []
                : m(
                    Title,
                    vnode.attrs.loaded === false
                      ? {
                          loaded: false,
                        }
                      : vnode.attrs.title,
                  ),
              vnode.attrs.progressCurrent !== undefined &&
              vnode.attrs.progressSteps !== undefined
                ? m(
                    "div.Form__progress#form-progress",
                    vnode.attrs.progressSteps.map((step, i) => {
                      return m(
                        m.route.Link,
                        {
                          class:
                            i === (vnode.attrs.progressCurrent as number)
                              ? "Form__progress--current"
                              : "Form__progress--option",
                          disabled: step.disabled === true,
                          href: step.link,
                        },
                        step.name,
                      );
                    }),
                  )
                : [],
              vnode.attrs.loaded === false
                ? m(FormLoading)
                : vnode.children === undefined ||
                    (Array.isArray(vnode.children) &&
                      (vnode.children.length === 0 ||
                        (vnode.children.length === 1 &&
                          vnode.children[0] === null)))
                  ? []
                  : m(
                      "div.Form__contents",
                      {
                        id: `form-contents${
                          vnode.attrs.title === undefined
                            ? ""
                            : StringToID(vnode.attrs.title.name)
                        }`,
                      },
                      [
                        vnode.children,
                        vnode.attrs.lastModified === undefined
                          ? []
                          : m("div.GlobalFooter", [
                              m(
                                "span",
                                {
                                  id: "updated",
                                },
                                [
                                  `${AppState.data.translations.formLastUpdated}: ${AppState.formatCivilDate(
                                    Timestamp.fromString(
                                      vnode.attrs.lastModified!,
                                    ) // eslint-disable-line @typescript-eslint/no-non-null-assertion
                                      .toCivilDate(),
                                  )}`,
                                ],
                              ),
                            ]),
                      ],
                    ),
              vnode.attrs.loaded === false || vnode.attrs.buttons === undefined
                ? []
                : m(
                    "div.Form__buttons",
                    {
                      id: `form-buttons${
                        vnode.attrs.title === undefined
                          ? ""
                          : StringToID(vnode.attrs.title.name)
                      }`,
                    },
                    [
                      vnode.attrs.buttons.map(
                        (button: ButtonAttrs | null): m.Children => {
                          if (button === null) {
                            return [];
                          }
                          return m(Button, button);
                        },
                      ),
                    ],
                  ),
            ],
          );
    },
  };
}
