import type { FilterType } from "@lib/types/Filter";
import Stream from "mithril/stream";

import type { TableAttrs } from "./Table";
import { Table } from "./Table";
import { TableData, TableDataType } from "./TableData";
import type { TableColumnAttrs, TableHeaderSortAttrs } from "./TableHeader";

describe("TableData", () => {
  test("array", async () => {
    const attrs: TableColumnAttrs = {
      data: {
        array: ["A", "B", "C"],
      },
      id: "test",
      linkFormatter: (data: string): string => {
        return `/something/${data}`;
      },
      name: "test",
      property: "array",
    };
    testing.mount(TableData, attrs);
    const data = testing.find("#table-data-test");
    const link = testing.find(".TableData__link");
    testing.hasClass(data, "TableData__array");
    testing.text(link, "A");
  });

  test("bold", async () => {
    const attrs: TableColumnAttrs = {
      data: {
        bold: "Some text",
      },
      id: "test",
      name: "test",
      property: "bold",
      type: TableDataType.Bold,
    };
    testing.mount(TableData, attrs);
    const data = testing.find("#table-data-test");
    testing.hasClass(data, "TableData--bold");
  });

  test("checkbox", async () => {
    const attrs: TableColumnAttrs = {
      checkboxOnclick: (): void => {
        attrs.data.checkbox = false;
      },
      data: {
        checkbox: true,
      },
      id: "test",
      name: "test",
      permitted: () => {
        return true;
      },
      property: "checkbox",
      type: TableDataType.Checkbox,
    };
    testing.mount(TableData, attrs);
    testing.text("#table-data-test", "check_box");
    testing.click("#table-data-test");
    testing.text("#table-data-test", "check_box_outline_blank");
  });

  test("collapsible", async () => {
    const attrs: TableColumnAttrs = {
      collapsedNames: ["testing"],
      data: {
        name: "test",
      },
      id: "test",
      name: "test",
      onclick: () => {
        attrs.collapsedNames!.push("test");
      },
      property: "name",
      type: TableDataType.Collapsible,
    };
    testing.mount(TableData, attrs);
    const arrow = testing.find("#table-data-test > i");
    testing.hasClass(arrow, "GlobalButtonIconExpand");
    testing.hasClass(arrow, "GlobalButtonIconExpand--active");
    testing.click(arrow);
    testing.notHasClass(arrow, "GlobalButtonIconExpand--active");
  });

  test("currency", async () => {
    const attrs: TableColumnAttrs = {
      data: {
        number: 121,
      },
      id: "test",
      name: "test",
      property: "number",
      rightAlign: true,
      type: TableDataType.Currency,
    };
    testing.mount(TableData, attrs);
    const data = testing.find("#table-data-test");
    testing.text(data, " $1.21");
    testing.hasClass(data, "TableData--right");
    testing.hasClass(data, "TableData--positive");
    attrs.data.number = -5;
    testing.redraw();
    testing.hasClass(data, "TableData--negative");
  });

  test("drag", async () => {
    let dragEnd = false;

    const attrs: TableAttrs = {
      actions: [],
      class: "some-class",
      data: [
        {
          count: 1,
          id: "a",
          position: "0",
          value: "red",
        },
        {
          count: 2,
          id: "b",
          position: "1",
          value: "orange",
        },
        {
          count: 3,
          id: "c",
          position: "2",
          value: "yellow",
        },
      ],
      editOnclick: (): void => {},
      filters: [],
      loaded: true,
      sort: Stream<TableHeaderSortAttrs>({
        invert: false,
        property: "count",
      }),
      tableColumns: [
        {
          formatter: (a: any): number => {
            return a.position;
          },
          name: "Priority",
          ondragend: async (): Promise<void> => {
            dragEnd = true;

            return;
          },
          property: "position",
          type: TableDataType.Drag,
        },
        {
          name: "Count",
          property: "count",
        },
        {
          name: "Something",
          property: "something",
        },
      ],
      tableColumnsNameEnabled: Stream<FilterType>({
        position: "",
        count: "", // eslint-disable-line sort-keys
        value: "",
        name: "", // eslint-disable-line sort-keys
      }),
    };
    testing.mount(Table, attrs);

    const drag = testing.find(".TableData__draggable");
    drag.dispatchEvent(new Event("dragstart"));
    await testing.sleep(100);
    testing.hasClass(drag.parentElement as HTMLElement, "TableData__dragging");

    const el2 = drag.parentElement?.nextElementSibling as HTMLElement;
    const el3 = el2.nextElementSibling as HTMLElement;

    testing.mocks.elementFromPoint = el3;

    const dragEvent = new Event("drag") as any;
    dragEvent.clientY = 0;
    drag.dispatchEvent(dragEvent);

    testing.hasClass(el3, "TableData__dragtarget");
    expect(testing.mocks.elementFromPoint.id).toBe("table-row_c");

    testing.mocks.elementFromPoint = el2;

    drag.dispatchEvent(dragEvent);

    testing.hasClass(el2, "TableData__dragtarget");
    testing.notHasClass(el3, "TableData__dragtarget");

    drag.dispatchEvent(new Event("dragend"));

    testing.notHasClass(el2, "TableData__dragtarget");

    expect(dragEnd).toBeTruthy();
  });

  test("duration", async () => {
    const attrs: TableColumnAttrs = {
      data: {
        number: 121,
      },
      id: "test",
      name: "test",
      property: "number",
      type: TableDataType.Duration,
    };
    testing.mount(TableData, attrs);
    const data = testing.find("#table-data-test");
    testing.text(data, "2h 1m");
  });

  test("icon", async () => {
    const attrs: TableColumnAttrs = {
      data: {
        number: "star star star",
      },
      id: "test",
      name: "test",
      property: "number",
      type: TableDataType.Icon,
    };
    testing.mount(TableData, attrs);
    const data = testing.find("#table-data-test");
    testing.text(data, "starstarstar");
    testing.hasClass(data, "TableData__icon");
  });

  test("image", async () => {
    const attrs: TableColumnAttrs = {
      data: {
        image: "test",
      },
      id: "test",
      name: "test",
      property: "image",
      type: TableDataType.Image,
    };
    testing.mount(TableData, attrs);
    const data = testing.find("#table-data-test");
    const image = testing.find(".TableData__img");
    testing.hasClass(data, "TableData");
    testing.hasClass(data, "TableData--center");
    testing.hasAttribute(image, "src", "test");
  });

  test("link", async () => {
    const attrs: TableColumnAttrs = {
      data: {
        id: 1,
        link: "blue",
        value: "test",
      },
      id: "test",
      linkFormatter: (data: { link: string; value: string }): string => {
        return `/test/${data.link}?key=${data.value}`;
      },
      name: "test",
      positive: (): boolean => {
        return false;
      },
      property: "link",
      type: TableDataType.Link,
    };
    testing.mount(TableData, attrs);
    const data = testing.find("a");
    testing.hasAttribute(data, "href", "#!/test/blue?key=test");
    testing.text(data, `${attrs.data.link}`);
    testing.hasClass("td", "TableData--negative");
    attrs.positive = () => {
      return true;
    };
    testing.redraw();
    testing.hasClass("td", "TableData--positive");
    attrs.positive = undefined;
    testing.redraw();
    testing.hasClass("td", "GlobalLink");
  });

  test("secret", async () => {
    const attrs: TableColumnAttrs = {
      data: {
        secret: "hello world",
      },
      id: "test",
      name: "test",
      property: "secret",
      type: TableDataType.Secret,
    };
    testing.mount(TableData, attrs);
    const data = testing.find("#table-data-test");
    testing.text(data, "********visibility_offcontent_paste");
    testing.click(testing.find("#table-data-test > i"));
    testing.text(data, "hello worldvisibilitycontent_paste");
  });

  test("timestamp", async () => {
    const attrs: TableColumnAttrs = {
      data: {
        timestamp: "2019-05-08T01:02:26.113516Z",
      },
      id: "test",
      name: "test",
      property: "timestamp",
      type: TableDataType.Timestamp,
    };
    testing.mount(TableData, attrs);
    const data = testing.find("#table-data-test");
    testing.text(data, "05/07/2019");
  });

  test("data", async () => {
    const attrs: TableColumnAttrs = {
      data: {
        value: "test",
      },
      id: "test",
      name: "test",
      property: "value",
      type: TableDataType.Link,
    };
    testing.mount(TableData, attrs);
    const data = testing.find("#table-data-test");
    testing.text(data, attrs.data.value);
  });
});
