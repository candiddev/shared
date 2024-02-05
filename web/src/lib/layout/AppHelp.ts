import "./AppHelp.css";

import m from "mithril";

import { Form } from "../components/Form";
import { AppState } from "../states/App";

export function AppHelp(): m.Component {
  return {
    view: (): m.Children => {
      return AppState.isLayoutAppHelpOpen()
        ? m(
            Form,
            {
              buttons: [
                {
                  name: AppState.data.translations.actionClose,
                  onclick: async (): Promise<void> => {
                    return new Promise((resolve) => {
                      AppState.toggleLayoutAppHelpOpen(false);

                      return resolve();
                    });
                  },
                  permitted: true,
                  requireOnline: false,
                },
              ],
              overlay: true,
              title: {
                name: AppState.data.translations.help,
              },
            },
            m("iframe", {
              src: AppState.data.layoutAppHelpLink,
              style: {
                border: "none",
                height: "100%",
                width: "100%",
              },
            }),
          )
        : [];
    },
  };
}
