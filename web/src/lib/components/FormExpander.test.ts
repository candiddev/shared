import { FormExpander } from "./FormExpander";

test("FormExpander", async () => {
  const attrs = {
    expand: false,
    name: "test",
    onclick: () => {
      attrs.expand = !attrs.expand;
    },
  };

  testing.mount(FormExpander, attrs);

  const expander = testing.find("#form-expander-test");
  testing.text(expander, "testexpand_less");
  const arrow = testing.find("#form-expander-test > i");
  testing.hasClass(arrow, "GlobalButtonIconExpand");
  testing.notFind(".GlobalButtonIconExpand--active");
  testing.click("#form-expander-test");
  testing.find(".GlobalButtonIconExpand--active");
});
