import { Chart } from "chart.js";
import Stream from "mithril/stream";

import type { ChartCanvasAttrs } from "./ChartCanvas";
import { ChartCanvas, ChartTypesEnum } from "./ChartCanvas";

test("ChartCanvas", async () => {
  const data = Stream({
    datasets: [
      {
        data: [1],
      },
    ],
    labels: ["test"],
  });

  testing.mount(ChartCanvas, {
    data: data,
    id: "chart",
    label: "Chart",
    type: ChartTypesEnum.Bar,
  } as ChartCanvasAttrs);

  const el = testing.find("#chart");

  expect(Chart).toHaveBeenCalledWith(el, {
    data: data(),
    options: undefined,
    type: "bar",
  });
});
