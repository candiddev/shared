import { Currency, CurrencyEnum } from "./Currency";

const tests = [
	{
		enums: [
			CurrencyEnum.AED,
		],
		string: "AED 1,234.56",
	},
	{
		enums: [
			CurrencyEnum.AUD,
		],
		string: "A$1,234.56",
	},
	{
		enums: [
			CurrencyEnum.BRL,
		],
		string: "R$1,234.56",
	},
	{
		enums: [
			CurrencyEnum.CAD,
		],
		string: "CA$1,234.56",
	},
	{
		enums: [
			CurrencyEnum.CHF,
		],
		string: "CHF 1,234.56",
	},
	{
		enums: [
			CurrencyEnum.CLP,
		],
		string: "CLP 123,456",
	},
	{
		enums: [
			CurrencyEnum.DKK,
		],
		string: "DKK 1,234.56",
	},
	{
		enums: [
			CurrencyEnum.EUR,
		],
		string: "€1,234.56",
	},
	{
		enums: [
			CurrencyEnum.GBP,
		],
		string: "£1,234.56",
	},
	{
		enums: [
			CurrencyEnum.INR,
		],
		string: "₹1,234.56",
	},
	{
		enums: [
			CurrencyEnum.JPY,
		],
		string: "¥123,456",
	},
	{
		enums: [
			CurrencyEnum.KRW,
		],
		string: "₩123,456",
	},
	{
		enums: [
			CurrencyEnum.USD,
		],
		string: "$1,234.56",
	},
	{
		enums: [
			CurrencyEnum.MXN,
		],
		string: "MX$1,234.56",
	},
	{
		enums: [
			CurrencyEnum.SEK,
		],
		string: "SEK 1,234.56",
	},
	{
		enums: [
			CurrencyEnum.TWD,
		],
		string: "NT$1,234.56",
	},
	{
		enums: [
			CurrencyEnum.ZAR,
		],
		string: "ZAR 1,234.56",
	},
];

describe("Currency", () => {
	test("toNumber", () => {
		expect(Currency.toNumber("currency?"))
			.toBe(0);

		expect(Currency.toNumber("-$2.00"))
			.toBe(-200);

		expect(Currency.toNumber("-$0.00"))
			.toBe(0);

		for (const test of tests) {
			expect(Currency.toNumber(test.string))
				.toBe(123456);
		}
	});

	test("toString", () => {
		expect(Currency.toString(0, CurrencyEnum.USD))
			.toBe(" $0.00");

		for (const test of tests) {
			for (const e of test.enums) {
				expect(Currency.toString(123456, e))
					.toBe(` ${test.string}`);
			}
		}
	});
});
