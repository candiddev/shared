import "./AppHeader.css";

import m from "mithril";

import type { AppLogoComponentAttrs } from "./AppLogo";
import { AppLogo } from "./AppLogo";

export interface AppHeaderAttrs {
  /** Logo attributes. */
  logo(): m.Component<AppLogoComponentAttrs>;
}

export function AppHeader(): m.Component<AppHeaderAttrs> {
  return {
    view: (vnode): m.Children => {
      return m("header.AppHeader#app-header", [
        m(AppLogo, {
          logo: vnode.attrs.logo,
        }),
      ]);
    },
  };
}
