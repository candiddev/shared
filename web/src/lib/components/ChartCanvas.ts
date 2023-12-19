import "./ChartCanvas.css";

import { AppState } from "@lib/states/App";
import { Color } from "@lib/types/Color";
import type { ChartConfiguration, ChartData, ChartItem, ChartTypeRegistry } from "chart.js";
import { ArcElement, BarController, BarElement, CategoryScale, Chart, DoughnutController, LinearScale, LineController, LineElement, PointElement, Tooltip } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import m from "mithril";
import Stream from "mithril/stream";

let init = false;

const ChartTypes = [
	"doughnut",
	"bar",
];

export enum ChartTypesEnum {
	Doughnut,
	Bar,
}

export interface ChartCanvasAttrs {
	/** Data to render into a chart. */
	data: Stream<ChartCanvasData | undefined>,

	/** ID of the chart. */
	id: string,

	/** Options for the chart. */
	options?: ChartCanvasOptions,

	/** Type of Chart. */
	type: ChartTypesEnum,
}

export type ChartCanvasData = ChartData; // eslint-disable-line @typescript-eslint/no-type-alias
export type ChartCanvasOptions = ChartConfiguration<keyof ChartTypeRegistry, number[], string>["options"]; // eslint-disable-line @typescript-eslint/no-type-alias

export function ChartCanvas (): m.Component<ChartCanvasAttrs> {
	let chart: Chart | undefined  = undefined;
	let s = Stream<void>(undefined);

	return {
		oninit: (): void => {
			if (!init) {
				Chart.register(
					ArcElement,
					BarController,
					BarElement,
					CategoryScale,
					ChartDataLabels,
					DoughnutController,
					LineController,
					LineElement,
					LinearScale,
					PointElement,
					Tooltip,
				);

				init = true;
			}

			const app = window.document.getElementById("app")!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
			let backgroundColors: string[] = [];
			let colors: string[] = [];

			if (app !== null) {
				backgroundColors = [
					Color.toHex("red", AppState.preferences().darkMode),
					Color.toHex("pink", AppState.preferences().darkMode),
					Color.toHex("orange", AppState.preferences().darkMode),
					Color.toHex("yellow", AppState.preferences().darkMode),
					Color.toHex("green", AppState.preferences().darkMode),
					Color.toHex("teal", AppState.preferences().darkMode),
					Color.toHex("blue", AppState.preferences().darkMode),
					Color.toHex("indigo", AppState.preferences().darkMode),
					Color.toHex("purple", AppState.preferences().darkMode),
					Color.toHex("brown", AppState.preferences().darkMode),
					Color.toHex("black", AppState.preferences().darkMode),
					Color.toHex("gray", AppState.preferences().darkMode),
					Color.toHex("white", AppState.preferences().darkMode),
				];
				colors = backgroundColors.map((color) => {
					return Color.contentColor(color);
				});

				Chart.defaults.datasets.line.backgroundColor = `${window.getComputedStyle(app)
					.getPropertyValue("--color_secondary")}`;
			}

			if (Chart.defaults.plugins.datalabels !== undefined) {
				Chart.defaults.plugins.datalabels.color = colors;
			}
			Chart.defaults.datasets.doughnut.backgroundColor = backgroundColors;
			Chart.defaults.datasets.doughnut.hoverBackgroundColor = backgroundColors;
			Chart.defaults.datasets.line.borderColor = Chart.defaults.datasets.line.backgroundColor;
		},
		onremove: async (): Promise<void> => { // eslint-disable-line @typescript-eslint/no-explicit-any
			s.end(true);

			if (chart !== undefined) {
				chart.destroy();
			}
		},
		view: (vnode): m.Children => {
			return m("div.ChartCanvas__chart", m(`canvas#${vnode.attrs.id}`, {
				oncreate: (c): void => {
					s = vnode.attrs.data.map((data) => {
						if (chart !== undefined) {
							chart.destroy();
						}

						if (data !== undefined) {
							let el = c.dom as ChartItem;

							if (process.env.NODE_ENV !== "test") {
								el = (c.dom as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
							}

							chart = new Chart(el, {
								data: data,
								options: vnode.attrs.options,
								type: ChartTypes[vnode.attrs.type] as keyof ChartTypeRegistry, // eslint-disable-line @typescript-eslint/consistent-type-assertions
							});
						}
					});
				},
			}));
		},
	};
}
