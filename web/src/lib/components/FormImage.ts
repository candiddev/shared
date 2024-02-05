import "./FormItem.css";
import "./FormImage.css";

import { AppState } from "@lib/states/App";
import m from "mithril";

import { StringToID } from "../utilities/StringToID";
import { Button } from "./Button";
import { NoImage } from "./NoImage";

export interface FormImageAttrs {
  /** Is the input disabled? */
  disabled?: boolean;

  /** Name of the input, will display on the left side. */
  name: string;
  onclick?(): void;
  oninput(image: string): void;

  /** Text to display below the input. */
  text?: string;

  /** Value of the image as a data object. */
  value: string | undefined;
}

export function FormImage(): m.Component<FormImageAttrs> {
  return {
    view: (vnode): m.Children => {
      if (vnode.attrs.disabled === undefined) {
        vnode.attrs.disabled = false;
      }
      return [
        m(
          "div.FormItem.FormImage",
          {
            class:
              vnode.attrs.onclick === undefined
                ? undefined
                : "FormImage--click",
          },
          [
            vnode.attrs.disabled && vnode.attrs.onclick === undefined
              ? []
              : m(
                  "div.FormItem__label",
                  m(
                    "label",
                    {
                      id: `form-image-label${StringToID(vnode.attrs.name)}`,
                    },
                    vnode.attrs.name,
                  ),
                ),
            vnode.attrs.value === undefined || vnode.attrs.value === ""
              ? m(NoImage)
              : m("img", {
                  alt: vnode.attrs.name,
                  id: `form-image${StringToID(vnode.attrs.name)}`,
                  onclick: vnode.attrs.onclick,
                  src: vnode.attrs.value,
                }),
            vnode.attrs.text === undefined
              ? []
              : m(
                  "p.FormImage__text",
                  {
                    id: `form-image-text${StringToID(vnode.attrs.name)}`,
                  },
                  vnode.attrs.text,
                ),
            vnode.attrs.disabled
              ? []
              : [
                  m("input.FormItem__field", {
                    disabled: vnode.attrs.disabled,
                    id: `form-image-input${StringToID(vnode.attrs.name)}`,
                    oninput: (e: m.Input) => {
                      const files = e.target.files;
                      if (files === null) {
                        return;
                      }
                      const file = files[0];
                      const reader = new FileReader();
                      reader.onload = (): void => {
                        const img = document.createElement("img");
                        if (
                          reader.result !== null &&
                          typeof reader.result === "string"
                        ) {
                          img.src = reader.result;
                        }
                        img.onload = (): void => {
                          const canvas = document.createElement("canvas");

                          canvas.width = 300;
                          canvas.height = 300;
                          const ctx = canvas.getContext("2d");
                          if (ctx !== null) {
                            const imgSize = Math.min(img.width, img.height);
                            const left = (img.width - imgSize) / 2;
                            const top = (img.height - imgSize) / 2;

                            ctx.drawImage(
                              img,
                              left,
                              top,
                              imgSize,
                              imgSize,
                              0,
                              0,
                              300,
                              300,
                            );
                          }

                          const image = canvas.toDataURL("image/jpeg");
                          vnode.attrs.oninput(image);
                          m.redraw();
                        };
                      };
                      reader.readAsDataURL(file);
                    },
                    type: "file",
                  }),
                  m("div.FormImage__buttons", [
                    m(Button, {
                      name: "Clear",
                      onclick: async (): Promise<void> => {
                        return new Promise((resolve) => {
                          vnode.attrs.oninput("");

                          return resolve();
                        });
                      },
                      permitted: true,
                      requireOnline: true,
                    }),
                    m(Button, {
                      for: `form-image-input${StringToID(vnode.attrs.name)}`,
                      name: AppState.data.translations.formImageSelect,
                      permitted: true,
                      requireOnline: true,
                    }),
                  ]),
                ],
          ],
        ),
      ];
    },
  };
}
