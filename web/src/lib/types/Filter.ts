import { NewErr } from "../services/Log";
import { Clone } from "../utilities/Clone";
import type { SortArgs } from "../utilities/Sort";
import { Sort } from "../utilities/Sort";

export interface FilterData {
	[index: string]: any, // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface FilterType {
	[index: string]: string | undefined,
}

export const Filter = {
	array: <T extends FilterData> (items: T[], filter: FilterType, sort: SortArgs): T[] => {
		if (Object.keys(filter).length === 0) {
			Sort(items, sort);

			return items;
		}

		const output = items.filter((item) => {
			let filtering = false;
			let filtered = true;
			let include = false;

			for (const property of Object.keys(filter)) {
				let value: string | undefined;

				if (property.includes(".")) {
					const properties = property.split(".");

					value = item[properties[0]][properties[1]];
				} else if (property.includes("+")) {
					const properties = property.split("+");

					value = item[properties[0]] + item[properties[1]]; // eslint-disable-line @typescript-eslint/restrict-plus-operands
				} else {
					value = item[property];
				}

				if (filter[property] !== undefined && filter[property] !== "") {
					filtering = true;
					try {
						const reg = new RegExp(filter[property]!.toLowerCase()); // eslint-disable-line @typescript-eslint/no-non-null-assertion
						if (reg.test(`${value}`.toLowerCase())) {
							filtered = filtered === true;
						} else {
							filtered = false;
						}
					} catch (e) {
						NewErr(`Filter: error trying to match regexp: ${e}`);
					}
				}

				include = value !== undefined || filter[property] === "";
			}

			return filtering && filtered || !filtering && include;
		});

		Sort(output, sort);

		return output;
	},
	selected: (filter: FilterType, property: string): string[] => {
		if (filter[property] !== undefined) {
			return (filter[property] as string).split("|");
		}

		return [];
	},
	toggle: (filter: FilterType, property: string, item: string): FilterType => {
		const newFilter = Clone(filter);

		let items: string[] = [];

		if (newFilter[property] !== "") {
			items = (newFilter[property] as string).split("|");
		}

		const index = items.indexOf(item);

		if (index < 0) {
			items.push(item);
		} else {
			items.splice(index, 1);
		}

		newFilter[property] = items.join("|");

		return newFilter;
	},
};
