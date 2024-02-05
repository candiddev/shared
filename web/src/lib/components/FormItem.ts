import "./FormItem.css";

import m from "mithril";
import type Stream from "mithril/stream";

import { AppState } from "../states/App";
import { DisplayEnum } from "../types/Display";
import { Icons } from "../types/Icons";
import { Animate, Animation } from "../utilities/Animate";
import { SetClass } from "../utilities/SetClass";
import { StringToID } from "../utilities/StringToID";
import type { ButtonArrayAttrs } from "./ButtonArray";
import { ButtonArray } from "./ButtonArray";
import type { FormItemInputAttrs } from "./FormItemInput";
import { FormItemInput } from "./FormItemInput";
import type { FormItemSelectAttrs } from "./FormItemSelect";
import { FormItemSelect } from "./FormItemSelect";
import type { FormItemTextAreaAttrs } from "./FormItemTextArea";
import { FormItemTextArea } from "./FormItemTextArea";
import { Icon } from "./Icon";
import { Markdown } from "./Markdown";
import { Tooltip } from "./Tooltip";

export interface FormItemAutocompleteParseOutput {
  /** A list of new options for the autocomplete menu. */
  options: string[];

  /** Text to be inserted into the autocomplete text. */
  splice: string;

  /** Whether to keep showing the menu. */
  visible: boolean;
}

export interface FormItemAutocompleteParser {
  /** A list of global autocomplete options. */
  options: Stream<string[]>;
  parse(input: string): FormItemAutocompleteParseOutput;
}

export interface FormItemAttrs {
  /** A list of initial autocomplete options.  The parse function can change these. */
  autocompleteOptions?: string[];

  /** Set the FormItem as a ButtonArray. */
  buttonArray?: ButtonArrayAttrs;

  /** Hide the label of the FormItem. */
  hidden?: boolean;

  /** Set the FormItem as a FormItemInput. */
  input?: FormItemInputAttrs;

  /** Nam eof the FormItem, will be used as the label. */
  name: string;

  /** Set the FormItem as a FormItemSelect. */
  select?: FormItemSelectAttrs;

  /** Start a ButtonArray collapsed. */
  startHidden?: boolean;

  /** Set the FormItem as a FormItemTextArea. */
  textArea?: FormItemTextAreaAttrs;

  /** On hover tooltip text. */
  tooltip: string;
}

function formatText(el: HTMLTextAreaElement, start: string, end: string): void {
  const ss = el.selectionStart;
  const se = el.selectionEnd;

  if (start === "#") {
    el.value = `${el.value} ${start}`;
  } else if (ss === undefined) {
    el.value = `${el.value}${start}${end}`;
    setTimeout(() => {
      // el.focus();
      el.setSelectionRange(start.length, start.length);
    }, 0);
  } else if (ss === se) {
    el.value = `${el.value.substring(0, ss)}${start}${end}${el.value.substring(se, el.value.length)}`;
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(ss + start.length, ss + start.length);
    }, 0);
  } else {
    el.value = `${el.value.substring(0, ss)}${start}${el.value.substring(ss, se)}${end}${el.value.substring(se, el.value.length)}`;
  }

  el.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      data: start,
    }),
  );
}

function getCursorLeftTop(input: HTMLInputElement | HTMLTextAreaElement): {
  left: number;
  top: number;
} {
  const div = document.createElement("div");
  const styles = getComputedStyle(input);

  if (styles.cssText === "") {
    const cssText = Object.values(styles).reduce((key, value) => {
      return `${key}${value}:${styles.getPropertyValue(value)};`;
    });
    div.style.cssText = cssText;
  } else {
    div.style.cssText = styles.cssText;
  }

  const inputValue =
    input.tagName === "INPUT" ? input.value.replace(/ /g, ".") : input.value;
  const textContent = inputValue.substr(0, input.selectionEnd!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
  div.textContent = textContent;
  const span = document.createElement("span");
  span.textContent = inputValue.substr(input.selectionEnd!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
  div.appendChild(span);
  document.body.appendChild(div);
  const { offsetLeft: spanLeft, offsetTop: spanTop } = span;

  const val = {
    left: spanLeft + input.offsetLeft,
    top: spanTop - input.scrollTop + 110,
  };

  document.body.removeChild(div);
  return val;
}

function getTextArea(name: string): HTMLTextAreaElement {
  return document.getElementById(
    `form-item-text-area${StringToID(name)}`,
  ) as HTMLTextAreaElement; // eslint-disable-line @typescript-eslint/consistent-type-assertions
}

export interface FormItemAutocompleteState {
  /** Index of the current highlighted autocomplete item. */
  active: number;

  /** Current autocomplete filter text. */
  filter: string;

  /** Cursor position, left. */
  left: number;

  /** A list of autocomplete options. */
  options: string[];

  /** Selection start position. */
  position: number;

  /** Cursor position, top. */
  top: number;

  /** Type of autocomplete selection, used by parser functions for state. */
  type: string;

  /** Is the autocomplete visible? */
  visible: boolean;
}

export function FormItem(): m.Component<FormItemAttrs> {
  const state: {
    /** Autocomplete state for parsing. */
    autocomplete: FormItemAutocompleteState;

    /** Track the buttonArrayLength for late loading buttons. */
    buttonArrayLength: number;

    /** Whether the button array is hidden/expanded. */
    hidden: boolean;

    /** For: ID prefix (input/select/textarea). */
    forID: string;
  } = {
    autocomplete: {
      active: 0,
      filter: "",
      left: 0,
      options: [],
      position: 0,
      top: 0,
      type: "",
      visible: false,
    },
    buttonArrayLength: 0,
    forID: "",
    hidden: false,
  };

  function parseAutocomplete(attrs: FormItemAttrs, input: string): void {
    state.autocomplete.active = 0;

    const output = AppState.parserFormItemAutocomplete.parse(input);

    if (output.options.length === 0) {
      if (attrs.autocompleteOptions === undefined) {
        state.autocomplete.options =
          AppState.parserFormItemAutocomplete.options();
      } else {
        state.autocomplete.options = attrs.autocompleteOptions;
      }
    } else {
      state.autocomplete.options = output.options;
    }

    state.autocomplete.visible = output.visible;

    if (attrs.textArea !== undefined && attrs.textArea.oninput !== undefined) {
      const textArea = document.getElementById(
        `form-item-text-area${StringToID(attrs.name)}`,
      ) as HTMLTextAreaElement; // eslint-disable-line @typescript-eslint/consistent-type-assertions
      const slice1 = textArea.value.slice(0, state.autocomplete.position);
      const slice2 = textArea.value.slice(
        state.autocomplete.position + state.autocomplete.filter.length,
      );
      attrs.textArea.oninput(slice1 + output.splice + slice2);
    } else if (attrs.input !== undefined && attrs.input.oninput !== undefined) {
      const input = document.getElementById(
        `form-item-input${StringToID(attrs.name)}`,
      ) as HTMLInputElement; // eslint-disable-line @typescript-eslint/consistent-type-assertions
      const slice1 = input.value.slice(0, state.autocomplete.position);
      const slice2 = input.value.slice(state.autocomplete.position);
      attrs.input.oninput(slice1 + output.splice + slice2);
    }

    state.autocomplete.filter = "";
    state.autocomplete.position += output.splice.length;
  }

  return {
    oninit: (vnode): void => {
      if (vnode.attrs.autocompleteOptions === undefined) {
        state.autocomplete.options =
          AppState.parserFormItemAutocomplete.options();
      } else {
        state.autocomplete.options = vnode.attrs.autocompleteOptions;
      }

      if (
        AppState.getSessionDisplay() < DisplayEnum.Small &&
        vnode.attrs.tooltip === ""
      ) {
        state.hidden = true;
      }

      if (vnode.attrs.buttonArray !== undefined) {
        vnode.attrs.buttonArray.name = vnode.attrs.name;

        if (
          vnode.attrs.buttonArray.value.length > 10 ||
          vnode.attrs.startHidden === true
        ) {
          state.hidden = true;
        }
      }

      if (vnode.attrs.input !== undefined) {
        state.forID = "input";
      }

      if (vnode.attrs.select !== undefined) {
        state.forID = "select";
      }

      if (vnode.attrs.textArea !== undefined) {
        state.forID = "text-area";
        vnode.attrs.textArea.name = vnode.attrs.name;
      }
    },
    onupdate: (vnode): void => {
      if (
        vnode.attrs.buttonArray !== undefined &&
        state.buttonArrayLength === 0 &&
        vnode.attrs.buttonArray.value.length > 10
      ) {
        state.buttonArrayLength = vnode.attrs.buttonArray.value.length;
        state.hidden = true;
        m.redraw();
      }
    },
    view: (vnode): m.Children => {
      if (
        vnode.attrs.buttonArray !== undefined &&
        vnode.attrs.buttonArray.value.length === 0
      ) {
        return [];
      }

      return m(
        `div.FormItem.${Animate.class(Animation.Fade)}`,
        {
          class:
            vnode.attrs.textArea === undefined
              ? undefined
              : "FormItem--textarea",
          id: `form-item${StringToID(vnode.attrs.name)}`,
          oninput: (e: m.Input) => {
            if (
              ((vnode.attrs.input !== undefined &&
                vnode.attrs.input.markdown === true) ||
                vnode.attrs.textArea !== undefined) &&
              state.autocomplete !== undefined
            ) {
              switch (e.inputType) {
                case "deleteContentBackward":
                  if (state.autocomplete.visible) {
                    if (state.autocomplete.filter === "") {
                      state.autocomplete.visible = false;
                    } else {
                      e.preventDefault();
                      state.autocomplete.filter =
                        state.autocomplete.filter.substring(
                          0,
                          state.autocomplete.filter.length - 1,
                        );
                    }
                  }
                  break;
              }

              if (e.data === " ") {
                state.autocomplete.visible = false;
                return;
              }

              if (e.data === null || e.data === undefined) {
                return;
              }

              if (e.data === "#" || e.data.endsWith("#")) {
                if (!state.autocomplete.visible) {
                  state.autocomplete.type = "";
                  if (process.env.NODE_ENV !== "test") {
                    const { left, top } = getCursorLeftTop(e.target);
                    state.autocomplete.left = left;
                    state.autocomplete.top = top;
                  }
                  if (
                    e.target.selectionStart !== undefined &&
                    e.target.selectionStart !== null
                  ) {
                    state.autocomplete.position = e.target.selectionStart;
                  }
                  state.autocomplete.visible = true;
                }
              } else if (state.autocomplete.visible && e.data.length === 1) {
                e.preventDefault();
                state.autocomplete.filter += e.data;
              }
            }
          },
          onkeydown: (e: m.Input) => {
            switch (e.key) {
              case "ArrowUp":
                if (state.autocomplete.visible) {
                  e.preventDefault();
                  state.autocomplete.active -= 1;

                  if (state.autocomplete.active === -1) {
                    // eslint-disable-line @typescript-eslint/no-non-null-assertion
                    state.autocomplete.active =
                      document
                        .getElementById(
                          `autocomplete${StringToID(vnode.attrs.name)}`,
                        )!
                        .getElementsByTagName("li").length - 1; // eslint-disable-line @typescript-eslint/no-non-null-assertion
                  }
                }
                break;
              case "ArrowDown":
                if (state.autocomplete.visible) {
                  e.preventDefault();
                  state.autocomplete.active += 1;
                  if (
                    state.autocomplete.active ===
                    document
                      .getElementById(
                        `autocomplete${StringToID(vnode.attrs.name)}`,
                      )!
                      .getElementsByTagName("li").length
                  ) {
                    // eslint-disable-line @typescript-eslint/no-non-null-assertion
                    state.autocomplete.active = 0;
                  }
                }
                break;
              case "Tab":
              case "Enter":
                if (state.autocomplete.visible) {
                  e.preventDefault();
                  const autocomplete = document.getElementById(
                    `autocomplete${StringToID(vnode.attrs.name)}-${state.autocomplete.active}`,
                  )!.textContent!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
                  parseAutocomplete(vnode.attrs, autocomplete);
                }
                break;
              case "Escape":
              case "#":
              case " ":
                if (
                  ((vnode.attrs.input !== undefined &&
                    vnode.attrs.input.markdown === true) ||
                    vnode.attrs.textArea !== undefined) &&
                  state.autocomplete.visible
                ) {
                  e.preventDefault();
                  state.autocomplete.filter = "";
                  state.autocomplete.visible = false;
                }
                break;
            }
          },
        },
        [
          vnode.attrs.hidden === true
            ? []
            : m(
                "div.FormItem__label",
                {
                  class: SetClass({
                    "FormItem--textarea": vnode.attrs.textArea !== undefined,
                    "FormItem__label--ButtonArray":
                      vnode.attrs.buttonArray !== undefined,
                  }),
                  onclick:
                    vnode.attrs.buttonArray === undefined ||
                    vnode.attrs.tooltip !== ""
                      ? undefined
                      : (): void => {
                          state.hidden = !state.hidden;
                        },
                },
                [
                  m(
                    "label",
                    {
                      for: `form-item-${state.forID}${StringToID(vnode.attrs.name)}`,
                      id: `form-item-label${StringToID(vnode.attrs.name)}`,
                    },
                    vnode.attrs.name,
                  ),
                  vnode.attrs.tooltip !== "" &&
                  (vnode.attrs.buttonArray !== undefined ||
                    (vnode.attrs.input !== undefined &&
                      vnode.attrs.input.disabled !== true) ||
                    (vnode.attrs.select !== undefined &&
                      vnode.attrs.select.disabled !== true) ||
                    (vnode.attrs.textArea !== undefined &&
                      vnode.attrs.textArea.disabled !== true))
                    ? m(Tooltip, {
                        markdown:
                          (vnode.attrs.input !== undefined &&
                            vnode.attrs.input.markdown === true) ||
                          vnode.attrs.textArea !== undefined,
                        value: vnode.attrs.tooltip,
                      })
                    : [],
                  vnode.attrs.buttonArray === undefined ||
                  vnode.attrs.tooltip !== ""
                    ? []
                    : m(
                        `i.GlobalButtonIconExpand${
                          state.hidden ? "" : ".GlobalButtonIconExpand--active"
                        }`,
                        {},
                        Icons.Expand,
                      ),
                ],
              ),
          vnode.attrs.textArea !== undefined &&
          vnode.attrs.textArea.disabled !== true
            ? m(
                "div.FormItem__toolbar",
                {
                  id: `form-item-toolbar${StringToID(vnode.attrs.name)}`,
                },
                [
                  m(Icon, {
                    icon: Icons.Bold,
                    onclick: async () => {
                      if (
                        vnode.attrs.textArea !== undefined &&
                        vnode.attrs.textArea.oninput !== undefined
                      ) {
                        const text = getTextArea(vnode.attrs.name);
                        formatText(text, "**", "**");
                      }
                    },
                  }),
                  m(Icon, {
                    icon: Icons.Italic,
                    onclick: async () => {
                      if (
                        vnode.attrs.textArea !== undefined &&
                        vnode.attrs.textArea.oninput !== undefined
                      ) {
                        const text = getTextArea(vnode.attrs.name);
                        formatText(text, "__", "__");
                      }
                    },
                  }),
                  m(Icon, {
                    icon: Icons.Link,
                    onclick: async () => {
                      if (
                        vnode.attrs.textArea !== undefined &&
                        vnode.attrs.textArea.oninput !== undefined
                      ) {
                        const text = getTextArea(vnode.attrs.name);
                        formatText(text, "[", "](url)");
                      }
                    },
                  }),
                  m(Icon, {
                    icon: Icons.ListBulleted,
                    onclick: async () => {
                      if (
                        vnode.attrs.textArea !== undefined &&
                        vnode.attrs.textArea.oninput !== undefined
                      ) {
                        const text = getTextArea(vnode.attrs.name);

                        let add = "- ";

                        if (vnode.attrs.textArea.value !== "") {
                          add = "\n\n- ";
                        }

                        formatText(text, add, "");
                      }
                    },
                  }),
                  m(Icon, {
                    icon: Icons.ListNumbered,
                    onclick: async () => {
                      if (
                        vnode.attrs.textArea !== undefined &&
                        vnode.attrs.textArea.oninput !== undefined
                      ) {
                        const text = getTextArea(vnode.attrs.name);

                        let add = "1. ";

                        if (vnode.attrs.textArea.value !== "") {
                          add = "\n\n1. ";
                        }

                        formatText(text, add, "");
                      }
                    },
                  }),
                  m(Icon, {
                    icon: Icons.Shortcut,
                    onclick: async () => {
                      if (
                        vnode.attrs.textArea !== undefined &&
                        vnode.attrs.textArea.oninput !== undefined
                      ) {
                        const text = getTextArea(vnode.attrs.name);
                        formatText(text, "#", "");
                      }
                    },
                  }),
                ],
              )
            : [],
          vnode.attrs.buttonArray === undefined || state.hidden
            ? []
            : [
                m(ButtonArray, {
                  ...{
                    name: vnode.attrs.name,
                  },
                  ...vnode.attrs.buttonArray,
                }),
                m(
                  "select",
                  {
                    id: `form-item-${state.forID}${StringToID(vnode.attrs.name)}`,
                    required: vnode.attrs.buttonArray.required,
                    value:
                      vnode.attrs.buttonArray.selected === undefined
                        ? ""
                        : vnode.attrs.buttonArray.selected().join(""),
                  },
                  vnode.attrs.buttonArray.value.map((value) => {
                    if (value === "") {
                      return [];
                    }

                    return m(
                      "option",
                      {
                        hidden: true,
                      },
                      typeof value === "string" ? value : value.id,
                    );
                  }),
                ),
              ],
          vnode.attrs.input === undefined
            ? []
            : m(FormItemInput, {
                ...{
                  name: vnode.attrs.name,
                },
                ...vnode.attrs.input,
              }),
          vnode.attrs.select === undefined
            ? []
            : m(FormItemSelect, {
                ...{
                  name: vnode.attrs.name,
                },
                ...vnode.attrs.select,
              }),
          vnode.attrs.textArea === undefined
            ? []
            : m(FormItemTextArea, {
                ...{
                  name: vnode.attrs.name,
                },
                ...vnode.attrs.textArea,
              }),
          state.autocomplete.visible
            ? m(
                "ul.FormItem__autocomplete",
                {
                  id: `autocomplete${StringToID(vnode.attrs.name)}`,
                  oncreate: (vnodeCreate: m.VnodeDOMHTML) => {
                    vnodeCreate.dom.style.setProperty(
                      "left",
                      `${state.autocomplete.left}px`,
                    );
                    vnodeCreate.dom.style.setProperty(
                      "top",
                      `${state.autocomplete.top}px`,
                    );
                  },
                },
                state.autocomplete.options
                  .filter((option, index) => {
                    return (
                      (index < 6 && state.autocomplete.filter === "") ||
                      option
                        .toLowerCase()
                        .includes(state.autocomplete.filter.toLowerCase())
                    );
                  })
                  .map((option: string, index: number) => {
                    return m(
                      "li.FormItem__option",
                      {
                        class:
                          state.autocomplete.active === index
                            ? "FormItem__option--highlight"
                            : undefined,
                        id: `autocomplete${StringToID(vnode.attrs.name)}-${index}`,
                        key: option,
                        onclick: (e: m.Event<MouseEvent>) => {
                          parseAutocomplete(
                            vnode.attrs,
                            e.target.textContent as string,
                          );
                        },
                        onmouseover: () => {
                          state.autocomplete.active = index;
                        },
                      },
                      m(Markdown, {
                        value: option,
                      }),
                    );
                  }),
              )
            : [],
        ],
      );
    },
  };
}
