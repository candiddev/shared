import type { TableSearchAttrs } from "./TableSearch";
import { TableSearch } from "./TableSearch";

describe("TableSearch", () => {
  test("it fires onsearch", async () => {
    let string = "";
    const attrs: TableSearchAttrs = {
      onsearch: (e) => {
        string = e;
      },
      placeholder: "Search test",
    };
    testing.mount(TableSearch, attrs);

    testing.find("#form-item-input-search-table");
    const searchbox = testing.find("#form-item-input-table");
    testing.hasAttribute(searchbox, "placeholder", attrs.placeholder);
    testing.input(searchbox, "testing");
    await testing.sleep(1200);
    expect(string).toBe("testing");
  });
});
