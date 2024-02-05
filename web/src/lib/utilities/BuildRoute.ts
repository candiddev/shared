import type { AppAttrs } from "@lib/layout/App";
import { App } from "@lib/layout/App";
import { Log } from "@lib/services/Log";
import { AppState } from "@lib/states/App";
import m from "mithril";

export interface BuildRouteOptions extends AppAttrs {
  onrouteinit?(args: any): Promise<void>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function BuildRoute(
  appview: () => Promise<() => m.Component>,
  options: BuildRouteOptions,
): m.RouteResolver {
  return {
    onmatch: async (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      args: any,
      path: string,
    ): Promise<(() => m.Component) | void> => {
      Log.debug(`Route: ${path} from ${m.route.get()}`);

      if (args.referral !== undefined) {
        localStorage.setItem("referral", args.referral);
      }

      if (args.token !== undefined) {
        localStorage.setItem("token", args.token);
      }

      if (path.includes("debug")) {
        AppState.toggleSessionDebug();
      }

      if (
        (m.route.get() === undefined || m.route.get() === "") &&
        options.onrouteinit !== undefined
      ) {
        if (path !== undefined) {
          AppState.setSessionRedirect(path);
        }

        await options.onrouteinit(args);
      }

      AppState.setLayoutAppForm();
      AppState.setLayoutAppMenuPath(path);
      AppState.toggleLayoutAppHelpOpen(false);

      return appview();
    },
    render: (vnode: m.Vnode): m.Children => {
      return m(
        App,
        {
          contactUs: options.contactUs,
          fullWidth: options.fullWidth,
          hideHeader: options?.hideHeader === true,
          logo: options.logo,
          menuComponents: options.menuComponents,
          public: options?.public,
          searcher: options.searcher,
          toolbarActions: options.toolbarActions,
        },
        vnode,
      );
    },
  };
}
