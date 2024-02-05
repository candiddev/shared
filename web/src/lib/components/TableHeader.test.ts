import Stream from "mithril/stream";

import type { FilterType } from "../types/Filter";
import type { TableLayoutAttrs } from "./TableHeader";
import { TableHeader } from "./TableHeader";

test("TableHeader", async () => {
  const data = Stream([
    {
      count: 1,
      item: "c",
    },
    {
      count: 2,
      item: "b",
    },
    {
      count: 3,
      item: "a",
    },
  ]);

  const sort = Stream({
    invert: true,
    property: "count",
  });

  const columns = Stream<FilterType>({
    count: "",
    item: "",
  });

  const attrs = {
    data: data(),
    sort: sort,
    tableColumns: [
      {
        formatter: (): string => {
          return "";
        },
        name: "Item",
        property: "item",
      },
      {
        name: "Count",
        noFilter: true,
        property: "count",
        rightAlign: true,
      },
    ],
    tableColumnsNameEnabled: columns,
  } as TableLayoutAttrs;
  testing.mount(TableHeader, attrs);
  const count = testing.find("#table-header-count");
  testing.find("#table-header");
  let item = testing.find("#table-header-item");
  testing.hasClass(count, "TableHeader--right");
  testing.text(count, "Countarrow_upward");
  testing.click(item);
  item = testing.find("#table-header-item");
  testing.redraw();
  testing.text(item, "Itemarrow_downwardfilter_alt");
  expect(sort()).toStrictEqual({
    formatter: attrs.tableColumns[0].formatter,
    invert: false,
    property: "item",
  });
  testing.click("#table-header-item > i");
  testing.input("#form-item-input-item", "b");
  expect(columns().item).toBe("b");
  attrs.noFilters = true;
  testing.redraw();
  testing.text(item, "Itemarrow_downward");
  attrs.sort = undefined;
  testing.redraw();
  testing.text(item, "Item");
});
