import { AppState } from "@lib/states/App";
import Stream from "mithril/stream";

import type {
  FormItemAttrs,
  FormItemAutocompleteParseOutput,
} from "./FormItem";
import { FormItem } from "./FormItem";

describe("FormItem", () => {
  test("buttonarray", () => {
    const attrs: FormItemAttrs = {
      buttonArray: {
        value: ["a", "b"],
      },
      name: "test",
      tooltip: "",
    } as FormItemAttrs;
    testing.mount(FormItem, attrs);
    testing.text("#button-array-test", "ab");
    testing.findAll(".FormItem__tooltip", 0);
  });

  test("input", async () => {
    const attrs: FormItemAttrs = {
      input: {
        datalist: ["Something"],
        oninput: (): void => {},
        type: "text",
        value: "",
      },
      name: "test",
      tooltip: "",
    };
    testing.mount(FormItem, attrs);
    testing.text("#form-item-label-test", attrs.name);
    testing.find("#form-item-input-test");
    testing.findAll(".FormItem__tooltip", 0);
  });

  test("select", async () => {
    const attrs = {
      name: "test",
      select: {
        oninput: () => {},
        options: ["Something"],
        value: "",
      },
      tooltip: "",
    };
    testing.mount(FormItem, attrs);
    testing.text("#form-item-label-test", attrs.name);
    testing.find("#form-item-select-test");
  });

  test("textarea + autocomplete", async () => {
    const attrs = {
      name: "test",
      textArea: {
        oninput: (e: string): void => {
          attrs.textArea.value = e;
        },
        value: "",
      },
      tooltip: "A tooltip",
    };

    let iteration = 0;
    AppState.parserFormItemAutocomplete.parse = (
      input,
    ): FormItemAutocompleteParseOutput => {
      iteration++;

      return iteration === 2
        ? {
            options: [],
            splice: `${input} `,
            visible: false,
          }
        : {
            options: ["1", "2", "3"],
            splice: `${input}/`,
            visible: true,
          };
    };
    AppState.parserFormItemAutocomplete.options = Stream([
      "apples",
      "bananas",
      "cantaloupe",
    ]);

    testing.mount(FormItem, attrs);
    testing.text("#form-item-label-test", attrs.name);
    testing.findAll(".Tooltips__tooltip", 2);
    testing.find("#form-item-text-area-test");

    // Toolbar
    const toolbar = testing.findAll("#form-item-toolbar-test > i");
    testing.click(toolbar[0]);
    testing.click(toolbar[1]);
    testing.click(toolbar[2]);
    testing.click(toolbar[3]);
    testing.click(toolbar[4]);
    expect(attrs.textArea.value).toBe("****____[](url)\n\n- \n\n1. ");
    attrs.textArea.value = "";

    // test autocomplete toggle
    testing.input("#form-item-test", "#");
    testing.redraw();
    const autocompleteMenu = testing.findAll("#autocomplete-test > li", 3);
    testing.text(autocompleteMenu[0], "apples");
    testing.hasClass(autocompleteMenu[0], "FormItem__option--highlight");

    // test autocomplete up/down
    testing
      .find("#form-item-test")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    testing.redraw();
    testing.notHasClass(autocompleteMenu[0], "FormItem__option--highlight");
    testing
      .find("#form-item-test")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    testing.redraw();
    testing.hasClass(autocompleteMenu[0], "FormItem__option--highlight");
    testing
      .find("#form-item-test")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    testing
      .find("#form-item-test")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    testing.find("#form-item-test");
    testing.redraw();

    // test autocomplete select
    testing.text(
      "#autocomplete-test > .FormItem__option--highlight",
      "cantaloupe",
    );
    testing
      .find("#form-item-test")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    testing.redraw();

    // test autocomplete filter
    testing
      .find("#form-item-test")
      .dispatchEvent(new InputEvent("input", { data: "x" }));
    testing.redraw();
    testing.findAll("#autocomplete-test > li", 0);
    testing
      .find("#form-item-test")
      .dispatchEvent(
        new InputEvent("input", { inputType: "deleteContentBackward" }),
      );
    testing.redraw();
    testing.findAll("#autocomplete-test > li", 3);
    testing
      .find("#form-item-test")
      .dispatchEvent(new InputEvent("input", { data: "2" }));
    testing.redraw();

    // test autocomplete render
    testing
      .find("#form-item-test")
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    testing.redraw();
    expect(attrs.textArea.value).toBe("cantaloupe/2 ");
    testing.notFind("#autocomplete-test");
  });
});
