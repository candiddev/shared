import { AppState } from "../states/App";
import { DisplayEnum } from "../types/Display";
import { Icons } from "../types/Icons";
import type { TitleAttrs } from "./Title";
import { Title } from "./Title";

describe("Title", () => {
  test("has buttons", async () => {
    let bool = false;
    const attrs: TitleAttrs = {
      buttonLeft: {
        href: "alink1",
        icon: Icons.Before,
        name: "left",
        onclick: async (): Promise<void> => {
          return new Promise((resolve) => {
            bool = true;
            return resolve();
          });
        },
        permitted: true,
        requireOnline: true,
      },
      buttonRight: {
        href: "alink2",
        icon: Icons.After,
        iconRight: true,
        name: "right",
        onclick: async (): Promise<void> => {
          return new Promise((resolve) => {
            bool = true;
            return resolve();
          });
        },
        permitted: true,
        requireOnline: true,
      },
      class: "test",
      name: "Test",
    };
    testing.mount(Title, attrs);

    const title = testing.find("#title-test");
    testing.hasClass(title, "test");
    const left = testing.find("#button-left");
    testing.click(left);
    testing.text(left, "arrow_upwardleft");
    expect(bool).toBeTruthy();

    testing.text("#title-test span", "Test");

    const right = testing.find("#button-right");
    testing.hasAttribute(right, "href", "#!alink2");
    testing.text(right, "rightarrow_downward");
  });

  test("has subtitle", async () => {
    const attrs: TitleAttrs = {
      name: "Test",
      subtitles: [
        {
          color: "blue",
          key: "Key",
          value: "Value",
        },
      ],
    };
    testing.mount(Title, attrs);

    const key = testing.find("#subtitle-key");
    testing.text(key, "KeyValue");
    testing.hasStyle("#subtitle-key > span:nth-of-type(2)", "color: blue");
  });

  test("has tabs", async () => {
    const attrs: TitleAttrs = {
      tabs: [
        {
          active: true,
          count: 5,
          href: "/tab1",
          name: "Tab1",
        },
        {
          active: false,
          href: "/tab2",
          name: "Tab2",
        },
      ],
    };
    testing.mount(Title, attrs);

    const tabs = testing.findAll("div > a", 2);
    testing.text("#tab-tab1", "Tab15");
    testing.hasClass(tabs[0], "Title__tab--active");
    testing.hasAttribute(tabs[0], "href", "#!/tab1");
    testing.text(tabs[0], "Tab15");
    testing.notHasClass(tabs[1], "Title__tab--active");

    AppState.data.sessionDisplay = DisplayEnum.Small;
    testing.redraw();
    testing.hasClass(tabs[0], "Title__tab--hidden");
    testing.input("#form-item-select-tab", "Tab2");
    expect(testing.mocks.route).toBe("/tab2");
  });

  test("is loading", async () => {
    const attrs: TitleAttrs = {
      loaded: false,
      name: "Test",
      subtitles: [
        {
          color: "blue",
          key: "Key",
          value: "Value",
        },
      ],
      tabs: [
        {
          active: true,
          count: 5,
          href: "/tab1",
          name: "Tab1",
        },
        {
          active: false,
          href: "/tab2",
          name: "Tab2",
        },
      ],
    };
    testing.mount(Title, attrs);

    testing.findAll(".Title__loading", 1);
    testing.findAll(".Title__header", 1);
    testing.findAll(".Title__subtitles", 1);
    testing.findAll(".Title__subtitle--loading", 1);
    testing.findAll(".Title__tab", 2);
  });
});
