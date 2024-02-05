import "./Or.css";

import { AppState } from "@lib/states/App";
import m from "mithril";

export function Or(): m.Component {
  return {
    view: (): m.Children => {
      return m("span.Or", AppState.data.translations.or);
    },
  };
}
