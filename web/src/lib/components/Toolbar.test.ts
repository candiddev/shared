import type { ToolbarAttrs } from "./Toolbar";
import { Toolbar } from "./Toolbar";

test("toolbar", async () => {
  const attrs: ToolbarAttrs = {
    actions: [
      {
        name: "action",
        onclick: async () => {},
        permitted: true,
        requireOnline: true,
      },
    ],
    filters: [
      {
        name: "filter",
        value: ["a"],
      },
    ],
  };

  testing.mount(Toolbar, attrs);

  testing.find(".Toolbar #button-action");
  testing.find(".Toolbar #button-array-filter");
});
