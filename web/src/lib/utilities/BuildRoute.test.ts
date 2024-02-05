import type { FormOverlayComponentAttrs } from "@lib/components/FormOverlay";
import type { AppMenuComponent } from "@lib/layout/AppMenu";
import { AppState } from "@lib/states/App";
import m from "mithril";
import Stream from "mithril/stream";
import { vi } from "vitest";

import { BuildRoute } from "./BuildRoute";

function component(): m.Component<FormOverlayComponentAttrs<any>> {
  return {
    view: (): m.Children => {
      return m("div");
    },
  };
}

vi.mock("mithril");

test("BuildRoute", async () => {
  let init = false;

  const resolver = BuildRoute(
    async () => {
      return new Promise((resolve) => {
        return resolve(component as any);
      });
    },
    {
      contactUs: component as any,
      logo: component as any,
      menuComponents: Stream([] as AppMenuComponent[]),
      onrouteinit: async (): Promise<void> => {
        init = true;

        return new Promise((resolve) => {
          return resolve();
        });
      },
      searcher: () => {
        return [];
      },
      toolbarActions: () => {
        return {};
      },
    },
  );

  AppState.data.layoutAppToolbarActionButtons = [
    {
      permitted: true,
      requireOnline: false,
    },
  ];
  AppState.setLayoutAppForm(component, {});
  AppState.setLayoutAppMenuPath("asdfasdf");
  AppState.toggleLayoutAppHelpOpen(true);

  await resolver.onmatch!(
    {
      referral: "test1",
      token: "test2",
    },
    "/test/debug",
    "test",
  );

  expect(init).toBeTruthy();
  expect(localStorage.getItem("referral")).toBe("test1");
  expect(localStorage.getItem("token")).toBe("test2");

  testing.mocks.route = "/test";

  await resolver.onmatch!(
    {
      referral: "test1",
      token: "test2",
    },
    "/test/debug",
    "test",
  );
  expect(AppState.getLayoutAppForm().component).toBeNull();
  expect(AppState.isSessionDebug()).toBeTruthy();
  expect(AppState.isLayoutAppHelpOpen()).toBeFalsy();
  expect(AppState.getLayoutAppMenuPath()).toBe("/test/debug");
});
