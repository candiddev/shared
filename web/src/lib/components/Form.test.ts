import { AppState } from "../states/App";
import { CivilDate } from "../types/CivilDate";
import { Timestamp } from "../types/Timestamp";
import type { FormAttrs } from "./Form";
import { Form } from "./Form";

describe("Form", () => {
  test("form", async () => {
    const fail = false;

    const modified = Timestamp.now();

    const input: FormAttrs = {
      buttons: [
        {
          name: "clicker",
          permitted: true,
          requireOnline: true,
          submit: true,
        },
      ],
      center: true,
      classes: ["test-form"],
      forceWide: true,
      lastModified: modified.toString(),
      onsubmit: async (): Promise<void> => {
        return new Promise((resolve, reject) => {
          if (fail) {
            return reject();
          }

          return resolve();
        });
      },
      progressCurrent: 1,
      progressSteps: [
        {
          link: "/a",
          name: "a",
        },
        {
          disabled: true,
          link: "/b",
          name: "b",
        },
      ],
      title: {
        name: "Sign Up",
      },
      wrap: true,
    } as FormAttrs;
    AppState.setSessionAuthenticated(false);

    testing.mount(Form, input, "div");

    testing.find("#button-clicker");
    testing.text("#title-sign-up", input.title!.name!);

    testing.notFind("#form-sign-up.Form--overlay");
    testing.find(
      "#form-sign-up.Form.Form.animationFadeAdd.Form--center.Form--wide.Form--wrap.test-form",
    );

    const progress = testing.find("#form-progress");
    testing.hasClass(
      progress.getElementsByTagName("a")[1], // eslint-disable-line no-restricted-syntax
      "Form__progress--current",
    ); // eslint-disable-line no-restricted-syntax
    testing.hasAttribute(progress.getElementsByTagName("a")[0], "href", "#!/a"); // eslint-disable-line no-restricted-syntax
    testing.hasAttribute(progress.getElementsByTagName("a")[1], "disabled", ""); // eslint-disable-line no-restricted-syntax
    testing.text(progress, "ab");
    testing.text(
      "#updated",
      `Last Updated: ${AppState.formatCivilDate(CivilDate.now())}`,
    );

    input.loaded = false;
    testing.redraw();

    testing.notFind("#form-buttons-sign-up");
    testing.notFind("#button-clicker");
    testing.notFind("#title-sign-up");
    testing.find("#form-loading");
  });

  test("overlay form", async () => {
    const input = {
      overlay: true,
      title: {
        name: "Log In",
      },
    };
    testing.mount(Form, input);
    testing.text("#title-log-in", input.title.name);
    testing.find("#form-log-in.Form--overlay");
  });
});
