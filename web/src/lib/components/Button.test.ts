import { AppState } from "../states/App";
import { Icons } from "../types/Icons";
import type { ButtonAttrs } from "./Button";
import { Button } from "./Button";

describe("Button", () => {
  test("nothing", async () => {
    const input: ButtonAttrs = {
      name: "button",
      onclick: async (): Promise<void> => {},
      permitted: true,
      requireOnline: true,
      submit: true,
    };
    AppState.data.sessionOnline = false;
    testing.mount(Button, input);
    testing.notFind("#button-button");
    AppState.data.sessionOnline = true;
  });

  test("download", async () => {
    const input: ButtonAttrs = {
      download: "something.txt",
      href: "blob:something",
      name: "link",
      permitted: true,
      requireOnline: false,
    };
    testing.mount(Button, input);
    const link = testing.find("#button-link");
    testing.hasAttribute(link, "download", "something.txt");
    testing.hasAttribute(link, "href", "blob:something");
    input.permitted = false;
    testing.redraw();
    testing.notFind("#button-link");
  });

  test("upload", async () => {
    const input: ButtonAttrs = {
      name: "link",
      oninput: () => {},
      permitted: true,
      requireOnline: false,
    };
    testing.mount(Button, input);
    const el = testing.find("input");
    testing.hasAttribute(el, "type", "file");
    input.permitted = false;
    testing.redraw();
    testing.notFind("#button-link");
  });

  test("label", async () => {
    const input: ButtonAttrs = {
      for: "test",
      name: "link",
      permitted: true,
      requireOnline: false,
    };
    testing.mount(Button, input);
    const el = testing.find("#button-link");
    testing.hasAttribute(el, "for", "test");
  });

  test("regular", async () => {
    let clicked = false;

    const input: ButtonAttrs = {
      icon: Icons.Add,
      iconRight: true,
      name: "button",
      onclick: async (): Promise<void> => {
        return new Promise((resolve) => {
          clicked = true;
          return resolve();
        });
      },
      permitted: true,
      requireOnline: false,
      submit: true,
    };
    testing.mount(Button, input);
    const el = testing.find("#button-button");
    testing.hasAttribute(el, "type", "submit");
    testing.text(el, "buttonadd");
    testing.click(el);
    expect(clicked).toBeTruthy();
  });

  test("link", async () => {
    const input: ButtonAttrs = {
      href: "/home",
      icon: Icons.Add,
      iconOnly: true,
      iconTop: true,
      name: "link",
      permitted: true,
      requireOnline: false,
      submit: false,
    };
    testing.mount(Button, input);
    const el = testing.find(
      "#button-link.Button.Button--icon.Button--icon-top",
    );
    testing.hasAttribute(el, "href", "#!/home");
    testing.text(el, "add");
  });
});
