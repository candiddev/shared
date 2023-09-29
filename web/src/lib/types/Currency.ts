export enum CurrencyEnum {
	USD,
	GBP,
	EUR,
	CAD,
	INR,
	JPY,
	KRW,
	MXN,
	RUB,
	CHF,
	ZAR,
	AUD,
	BRL,
	SEK,
	AED,
	DKK,
	TWD,
	CLP,
}

export const Currency = {
	toNumber: (currency: string): number => {
		let n = parseInt(currency.replace(/[((AED)(CHF)(CLP)(MX)(SEK)(NT)(ZAR)R€₹¥₩£$.,\s]/g, ""), 10);
		if (n === undefined || isNaN(n)) {
			return 0;
		}

		if (currency.startsWith("-") && n === 0) {
			return 0;
		}

		if (currency.includes("-") && n > 0 || currency.includes("+") && n < 0) {
			n *= -1;
		}

		return n;
	},
	toString: (currency: number, format: CurrencyEnum): string => {
		let n = currency;

		// 0 can be -0 in JS
		if (n === 0) {
			n = 0;
		}

		if (format !== CurrencyEnum.CLP && format !== CurrencyEnum.JPY && format !== CurrencyEnum.KRW && format !== CurrencyEnum.RUB) {
			n /= 100;
		}

		let str = n.toLocaleString(undefined, {
			currency: CurrencyEnum[format],
			currencyDisplay: "symbol",
			style: "currency",
		});

		if (! str.startsWith("-")) {
			str = ` ${str}`;
		}

		return str;
	},
};
