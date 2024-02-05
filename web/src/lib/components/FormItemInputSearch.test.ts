import { FormItemInputSearch } from "./FormItemInputSearch";
import { Or } from "./Or";

test("FormItemInputSearch", async () => {
  testing.mount(
    FormItemInputSearch,
    {
      name: "test",
      type: "text",
    },
    Or,
  );

  testing.find("#form-item-input-search-test");
  testing.findAll("i", 1);
  testing.findAll("span", 1);
});
