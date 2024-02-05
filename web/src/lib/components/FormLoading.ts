import "./FormLoading.css";

import m from "mithril";

import { Animate, Animation } from "../utilities/Animate";

export function FormLoading(): m.Component {
  return {
    view: (): m.Children => {
      return m(
        `div#form-loading.FormLoading.${Animate.class(Animation.Pulse)}`,
        [
          m("span"),
          m("div", [
            [...Array(5)].map(() => {
              return m("span");
            }),
          ]),
        ],
      );
    },
  };
}
