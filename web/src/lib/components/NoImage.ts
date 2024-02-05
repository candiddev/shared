import "./NoImage.css";

import { AppState } from "@lib/states/App";
import m from "mithril";

export function NoImage(): m.Component {
  return {
    view: (): m.Children => {
      return m("div.NoImage", AppState.data.translations.noImage);
    },
  };
}
