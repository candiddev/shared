import type { MarkdownParseOutput } from "@lib/components/Markdown";
import type { TelemetryOptions } from "@lib/services/Telemetry";
import { CivilDateOrderEnum, CivilDateSeparatorEnum } from "@lib/types/CivilDate";
import Stream from "mithril/stream";

import type { AppPreferences } from "./App";
import { AppState } from "./App";

describe("AppState", () => {
	test("init", async () => {
		const autocompleteOptions = [
			"1",
			"2",
		];

		let oncreate = false;

		AppState.init(
			(): string => {
				return "hello";
			},
			async (): Promise<void> => {
				return new Promise((resolve) => {
					oncreate = true;
					return resolve();
				});
			},
			(): TelemetryOptions => {
				return {
					endpoint: "http://example.com",
					path: "/api/test",
					serviceName: "test,",
				};
			},
			{
				options: Stream(autocompleteOptions),
				parse: () => {
					return {
						options: [],
						splice: "",
						visible: false,
					};
				},
			},
			{
				match: /test/,
				parse: (word): MarkdownParseOutput => {
					return {
						name: word,
					};
				},
			}, Stream({
				colorAccent: "red",
				colorNegative: "orange",
				colorPositive: "yellow",
				colorPrimary: "green",
				colorSecondary: "blue",
				darkMode: true,
				formatDateOrder: CivilDateOrderEnum.YMD,
				formatDateSeparator: CivilDateSeparatorEnum.Comma,
				formatTime24: true,
			} as AppPreferences),
			"test",
		);

		expect(AppState.parserFormItemAutocomplete.options())
			.toStrictEqual(autocompleteOptions);
		expect(AppState.parserMarkdown.match.test("test"))
			.toBeTruthy();
		expect(AppState.motd())
			.toBe("hello");
		await AppState.oncreate();
		expect(oncreate)
			.toBeTruthy();
		expect(AppState.preferences().colorAccent)
			.toBe("red");
		expect(AppState.product)
			.toBe("test");
	});
});
