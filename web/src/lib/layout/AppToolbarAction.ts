import "./AppToolbarAction.css";

import { AppState } from "@lib/states/App";
import { DisplayEnum } from "@lib/types/Display";
import { Icons } from "@lib/types/Icons";
import m from "mithril";

import { Button } from "../components/Button";
import type { DropdownMenuAttrsItem } from "../components/DropdownMenu";
import { DropdownMenu } from "../components/DropdownMenu";

export interface AppToolbarActionAttrs {
  [key: string]: DropdownMenuAttrsItem;
}

export function AppToolbarAction(): m.Component<AppToolbarActionAttrs> {
  const id = "app-toolbar-action";

  return {
    view: (vnode): m.Children => {
      return AppState.isSessionOnline()
        ? m("div.AppToolbarAction__menu--container#app-toolbar-action", [
            m(Button, {
              icon: Icons.Add,
              iconOnly: AppState.data.sessionDisplay < DisplayEnum.Small,
              id: "app-toolbar-action-toggle",
              name: AppState.data.translations.actionAdd,
              onclick: async (): Promise<void> => {
                return new Promise((resolve) => {
                  AppState.setComponentsDropdownMenu(id, 0);
                  return resolve();
                });
              },
              permitted: true,
              primary: true,
              requireOnline: false,
            }),
            m(DropdownMenu, {
              id: id,
              items: [
                ...(AppState.getLayoutAppToolbarActionButtons().length > 0
                  ? [
                      {
                        header: true,
                        name: AppState.data.translations
                          .appToolbarActionsOnThisPage,
                        permitted: true,
                        requireOnline: false,
                      },
                    ]
                  : []),
                ...AppState.getLayoutAppToolbarActionButtons(),
                ...Object.values(vnode.attrs),
              ],
            }),
          ])
        : [];
    },
  };
}
