import { Tooltip } from "./Tooltip";

test("Tooltips", async () => {
  testing.mount(Tooltip, {
    markdown: true,
    value: "Here is some [Markdown](https://homechart.app)",
  });
  testing.text(
    ".Tooltips__tooltip:nth-of-type(1)",
    "help_outlineHere is some Markdown",
  );
  testing.text(".Tooltips__tooltip:nth-of-type(2)", "Marrow_downwardmarkdown");
});
