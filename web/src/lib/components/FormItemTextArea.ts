import "./FormItem.css";
import "./FormItemTextArea.css";

import { AppState } from "@lib/states/App";
import m from "mithril";
import Tesseract from "tesseract.js";

import { Animate, Animation } from "../utilities/Animate";
import { StringToID } from "../utilities/StringToID";
import { Markdown } from "./Markdown";

export interface FormItemTextAreaAttrs {
  /** Are the lines in the FormItem clickable? */
  clickable?: boolean;

  /** Should the FormItem default to preview mode? */
  defaultPreview?: boolean;

  /** Is the FormItem disabled? */
  disabled?: boolean;

  /** Name of the FormItem. */
  name?: string;

  /** Disable image scanning. */
  noScan?: boolean;
  oninput?(value: string): void;

  /** Placeholder text for the FormItem. */
  placeholder?: string;

  /** Is the FormItem required? */
  required?: boolean;

  /** Current value of the FormItem. */
  value: string | undefined;
}

export function FormItemTextArea(): m.Component<FormItemTextAreaAttrs> {
  function setHeight(e: HTMLInputElement): void {
    const max =
      Math.max(document.documentElement.clientHeight, window.innerHeight) - 450;
    if (e.scrollHeight > 120 && max > 120) {
      if (e.scrollHeight > max) {
        e.style.setProperty("height", `${max}px`);
        return; // If text area is greater than viewport (and hides autocomplete suggestions at bottom) return
      }
      e.style.setProperty("height", "auto");
      e.style.setProperty("height", `${e.scrollHeight + 12}px`);
    } else {
      e.style.setProperty("height", "120px");
    }
  }

  let preview = false;
  const state = {
    loading: false,
    timer: 0,
  };
  return {
    oninit: (vnode): void => {
      if (vnode.attrs.defaultPreview === true) {
        preview = true;
      }
    },
    view: (vnode): m.Children => {
      return state.loading
        ? m(`div.FormItemTextArea__spinner.${Animate.class(Animation.Spin)}`)
        : [
            (vnode.attrs.disabled === true || preview) &&
            vnode.attrs.value !== undefined
              ? m(
                  "div.FormItemTextArea.FormItemTextArea--disabled",
                  {
                    id: `form-item-text-area${StringToID(vnode.attrs.name)}`,
                  },
                  m(Markdown, {
                    clickable: vnode.attrs.clickable,
                    value: vnode.attrs.value,
                  }),
                )
              : m("textarea.FormItem__field.FormItemTextArea", {
                  disabled: vnode.attrs.disabled,
                  id: `form-item-text-area${StringToID(vnode.attrs.name)}`,
                  oncreate: (vnodeCreate: m.VnodeDOMHTML) => {
                    setHeight(vnodeCreate.dom as HTMLInputElement); // eslint-disable-line @typescript-eslint/consistent-type-assertions
                  },
                  oninput: (e: m.Input) => {
                    clearTimeout(state.timer);
                    state.timer = window.setTimeout(() => {
                      if (vnode.attrs.oninput !== undefined) {
                        vnode.attrs.oninput(e.target.value);
                      }
                      m.redraw();
                    }, 500);
                    if (vnode.attrs.oninput !== undefined) {
                      vnode.attrs.oninput(e.target.value);
                    }
                  },
                  onupdate: (vnodeUpdate: m.VnodeDOMHTML) => {
                    setHeight(vnodeUpdate.dom as HTMLInputElement); // eslint-disable-line @typescript-eslint/consistent-type-assertions
                  },
                  placeholder: vnode.attrs.placeholder,
                  required: vnode.attrs.required,
                  value: vnode.attrs.value,
                }),
            vnode.attrs.disabled === true
              ? []
              : m("div.FormItem__bottom", [
                  vnode.attrs.noScan === true
                    ? []
                    : m("label", [
                        m("input", {
                          id: `form-item-text-area-scan${StringToID(vnode.attrs.name)}`,
                          onchange: async (e: m.Input) => {
                            if (e.target.files !== null) {
                              state.loading = true;

                              const reader = new FileReader();
                              reader.onload = async (): Promise<void> => {
                                const img = document.createElement("img");
                                if (
                                  reader.result !== null &&
                                  typeof reader.result === "string"
                                ) {
                                  img.src = reader.result;
                                }

                                img.onload = async (): Promise<void> => {
                                  const canvas =
                                    document.createElement("canvas");
                                  let ctx = canvas.getContext("2d");
                                  if (ctx !== null) {
                                    ctx.drawImage(img, 0, 0);
                                  }

                                  const MAX_WIDTH = 1000;
                                  const MAX_HEIGHT = 1000;
                                  let width = img.width;
                                  let height = img.height;

                                  if (width > height) {
                                    if (width > MAX_WIDTH) {
                                      height *= MAX_WIDTH / width;
                                      width = MAX_WIDTH;
                                    }
                                  } else if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                  }

                                  canvas.width = width;
                                  canvas.height = height;

                                  ctx = canvas.getContext("2d");
                                  if (ctx !== null) {
                                    ctx.drawImage(img, 0, 0, width, height);
                                  }

                                  const worker =
                                    await Tesseract.createWorker("eng");
                                  await worker.load();

                                  const data = await worker.recognize(canvas);
                                  if (vnode.attrs.oninput !== undefined) {
                                    vnode.attrs.oninput(
                                      `${vnode.attrs.value}\n${data.data.text}`,
                                    );
                                  }
                                  await worker.terminate();
                                  state.loading = false;
                                  m.redraw();
                                };
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          },
                          type: "file",
                        }),
                        AppState.data.translations.formItemTextAreaScanText,
                      ]),
                  m(
                    "span",
                    {
                      id: `form-item-text-area-preview${StringToID(vnode.attrs.name)}`,
                      onclick: (e: m.Input) => {
                        e.preventDefault();
                        preview = !preview;
                      },
                    },
                    preview
                      ? AppState.data.translations.actionEdit
                      : AppState.data.translations.actionPreview,
                  ),
                ]),
          ];
    },
  };
}
