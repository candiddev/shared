import { AppState } from "@lib/states/App";
import m from "mithril";

import { Currency, CurrencyEnum } from "../types/Currency";
import { FormItem } from "./FormItem";

export interface FormItemSelectCurrencyFormatAttrs {
	oninput(e: CurrencyEnum): void,

	/** Is the FormItem allowed? */
	permitted: boolean,

	/** Value of the FormItem. */
	value: CurrencyEnum,
}

export function FormItemSelectCurrencyFormat (): m.Component<FormItemSelectCurrencyFormatAttrs> {
	return {
		view: (vnode): m.Children => {
			return m(FormItem, {
				name: AppState.data.translations.formItemSelectCurrencyFormat,
				select: {
					disabled: ! vnode.attrs.permitted,
					oninput: (e: string): void => {
						if (! isNaN(parseInt(e, 10))) {
							vnode.attrs.oninput(parseInt(e, 10));
						}
					},
					options: [
						{
							id: `${CurrencyEnum.AUD}`,
							name: `AED - ${Currency.toString(123456, CurrencyEnum.AED)}`,
						},
						{
							id: `${CurrencyEnum.AUD}`,
							name: `AUD - ${Currency.toString(123456, CurrencyEnum.AUD)}`,
						},
						{
							id: `${CurrencyEnum.BRL}`,
							name: `BRL - ${Currency.toString(123456, CurrencyEnum.BRL)}`,
						},
						{
							id: `${CurrencyEnum.CAD}`,
							name: `CAD - ${Currency.toString(123456, CurrencyEnum.CAD)}`,
						},
						{
							id: `${CurrencyEnum.CHF}`,
							name: `CHF - ${Currency.toString(123456, CurrencyEnum.CHF)}`,
						},
						{
							id: `${CurrencyEnum.CLP}`,
							name: `CLP - ${Currency.toString(123456, CurrencyEnum.CLP)}`,
						},
						{
							id: `${CurrencyEnum.DKK}`,
							name: `DKK - ${Currency.toString(123456, CurrencyEnum.DKK)}`,
						},
						{
							id: `${CurrencyEnum.EUR}`,
							name: `EUR - ${Currency.toString(123456, CurrencyEnum.EUR)}`,
						},
						{
							id: `${CurrencyEnum.GBP}`,
							name: `GBP - ${Currency.toString(123456, CurrencyEnum.GBP)}`,
						},
						{
							id: `${CurrencyEnum.INR}`,
							name: `INR - ${Currency.toString(123456, CurrencyEnum.INR)}`,
						},
						{
							id: `${CurrencyEnum.JPY}`,
							name: `JPY - ${Currency.toString(123456, CurrencyEnum.JPY)}`,
						},
						{
							id: `${CurrencyEnum.KRW}`,
							name: `KRW - ${Currency.toString(123456, CurrencyEnum.KRW)}`,
						},
						{
							id: `${CurrencyEnum.MXN}`,
							name: `MXN - ${Currency.toString(123456, CurrencyEnum.MXN)}`,
						},
						{
							id: `${CurrencyEnum.RUB}`,
							name: `RUB - ${Currency.toString(123456, CurrencyEnum.RUB)}`,
						},
						{
							id: `${CurrencyEnum.USD}`,
							name: `USD - ${Currency.toString(123456, CurrencyEnum.USD)}`,
						},
						{
							id: `${CurrencyEnum.TWD}`,
							name: `TWD - ${Currency.toString(123456, CurrencyEnum.TWD)}`,
						},
						{
							id: `${CurrencyEnum.ZAR}`,
							name: `ZAR - ${Currency.toString(123456, CurrencyEnum.ZAR)}`,
						},
					],
					value: `${vnode.attrs.value}`,
				},
				tooltip: AppState.data.translations.formItemSelectCurrencyFormatTooltip,
			});
		},
	};
}
