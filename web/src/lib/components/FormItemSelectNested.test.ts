import { Color } from "@lib/types/Color";

import type { FormItemSelectNestedAttrs } from "./FormItemSelectNested";
import { FormItemSelectNested } from "./FormItemSelectNested";

test("FormItemSelectNested", async () => {
	let selected = null as NullUUID;

	const attrs: FormItemSelectNestedAttrs = {
		name: "Test",
		onselect: (e) => {
			selected = e;
		},
		options: [
			{
				id: null,
				level: 0,
				name: "None",
			},
			{
				color: "gray",
				icon: "add",
				id: "1",
				level: 0,
				name: "a",
			},
		],
		tooltip: "Test",
		value: selected,
	};

	testing.mount(FormItemSelectNested, attrs);

	testing.text("#form-item-label-test", "Test");
	const options = testing.findAll(".FormItemSelectNested__option", 2);
	testing.hasClass(options[0], "FormItemSelectNested__option--selected");
	testing.text(options[0], "None");
	testing.text(options[1], "adda");
	testing.hasStyle(".FormItemSelectNested__option:nth-child(2) > i", `color: ${Color.toHex("gray", false)}`);
	testing.click(options[1]);
	testing.hasClass(options[1], "FormItemSelectNested__option");
	expect(selected)
		.toBe("1");
});
