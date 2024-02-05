import m from "mithril";

import { FormItemInputSearch } from "./FormItemInputSearch";

export interface TableSearchAttrs {
  /** Placeholder value for the search. */
  placeholder: string;
  onsearch(e: string): void;
}

export function TableSearch(): m.Component<TableSearchAttrs> {
  const state = {
    search: "",
    timer: 0,
  };
  return {
    view: (vnode): m.Children => {
      return m(FormItemInputSearch, {
        autocomplete: "off",
        name: "table",
        oninput: (e): void => {
          clearTimeout(state.timer);
          state.timer = window.setTimeout(async () => {
            vnode.attrs.onsearch(e);
            m.redraw();
          }, 500);
          state.search = e;
        },
        placeholder: vnode.attrs.placeholder,
        type: "text",
        value: state.search,
      });
    },
  };
}
