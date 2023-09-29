import { Filter } from "./Filter";

test("filter", () => {
	const data = [
		{
			id: "1",
			name: "a",
			properties: {
				color: "blue",
			},
		},
		{
			id: "1",
			name: "b",
			properties: {
				color: "blue",
			},
		},
	];

	expect(Filter.array(data, {
		name: "",
	}, {
		invert: true,
		property: "name",
	}))
		.toStrictEqual([
			data[1],
			data[0],
		]);

	expect(Filter.array(data, {
		"name": "a",
		"properties.color": "blue",
	}, {}))
		.toStrictEqual([
			data[0],
		]);

	expect(Filter.array(data, {
		"name": "a",
		"name+id": "a1",
	}, {}))
		.toStrictEqual([
			data[0],
		]);
});
