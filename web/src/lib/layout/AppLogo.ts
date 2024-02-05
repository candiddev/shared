import "./AppLogo.css";

import { DisplayEnum } from "@lib/types/Display";
import m from "mithril";

import type { DropdownMenuAttrsItem } from "../components/DropdownMenu";
import { DropdownMenu } from "../components/DropdownMenu";
import { FormItemInputSearch } from "../components/FormItemInputSearch";
import { AppState } from "../states/App";

export interface AppLogoComponentAttrs {
  /** Link for what clicking the logo does. */
  link?: string;

  /** Render a small version of the logo. */
  small?: boolean;
}

export interface AppLogoAttrs {
  /** Logo to use within the AppSearch. */
  logo(): m.Component<AppLogoComponentAttrs>;

  searcher?(search: string): DropdownMenuAttrsItem[];
}

export function AppLogo(): m.Component<AppLogoAttrs> {
  const state: {
    /** Search items that will be populated in dropdown menu. */
    items: DropdownMenuAttrsItem[];

    /** Last search items that will be restored when a user begins a search. */
    lastSearches: DropdownMenuAttrsItem[];

    /** The user's search. */
    search: string;

    /** A timer that gets reset when a user types. */
    timer: number;
  } = {
    items: [],
    lastSearches: [],
    search: "",
    timer: 0,
  };
  return {
    view: (vnode): m.Children => {
      return m(
        "div.AppLogo",
        {
          id: "app-logo",
        },
        [
          m("div.AppLogo__toggles", [
            m(vnode.attrs.logo, {
              link: "/home",
              small: true,
            }),
            m(
              "i#app-logo-toggle.AppLogo__toggle",
              {
                onclick: (e: m.Event<MouseEvent>) => {
                  e.stopPropagation();
                  AppState.toggleLayoutAppMenuOpen();
                },
              },
              "menu",
            ),
          ]),
          vnode.attrs.searcher === undefined
            ? []
            : m(
                FormItemInputSearch,
                {
                  autocomplete: "off",
                  name: "app",
                  onfocus: (): void => {
                    AppState.setComponentsDropdownMenu("app-search", 0);

                    if (state.lastSearches.length > 0) {
                      state.items = state.lastSearches;
                    }
                  },
                  onfocusout: () => {
                    setTimeout(() => {
                      AppState.setComponentsDropdownMenu("", 0);
                      state.items = [];
                      state.search = "";
                    }, 500);
                  },
                  oninput: (e): void => {
                    clearTimeout(state.timer);
                    state.search = e;

                    state.timer = window.setTimeout(async () => {
                      if (state.search === "") {
                        state.items = [];

                        return;
                      }

                      if (vnode.attrs.searcher !== undefined) {
                        state.items = vnode.attrs.searcher(e);
                      }

                      // eslint-disable-next-line @typescript-eslint/no-for-in-array
                      for (const i in state.items) {
                        state.items[i].onclick = (): void => {
                          const index = state.lastSearches.findIndex((s) => {
                            return s.name === state.items[i].name;
                          });

                          if (index < 0) {
                            state.lastSearches.unshift(state.items[i]);

                            if (state.lastSearches.length > 5) {
                              state.lastSearches.pop();
                            }
                          }

                          if (
                            AppState.getSessionDisplay() < DisplayEnum.XLarge
                          ) {
                            AppState.toggleLayoutAppMenuOpen(false);
                          }
                        };
                      }

                      m.redraw();
                    }, 500);
                  },
                  placeholder: AppState.data.translations.actionSearch,
                  type: "text",
                  value: state.search,
                },
                state.items.length === 0
                  ? []
                  : m(DropdownMenu, {
                      id: "app-search",
                      items: state.items,
                      onclick: () => {
                        state.search = "";
                      },
                    }),
              ),
        ],
      );
    },
  };
}
