import { ColorEnum } from "../types/Color";
import type { FormItemSelectColorAttrs } from "./FormItemSelectColor";
import { FormItemSelectColor } from "./FormItemSelectColor";

test("FormItemSelectColor", async () => {
	let value = "";

	const attrs: FormItemSelectColorAttrs = {
		name: "test",
		oninput: (e): void => {
			value = e;
		},
		value: value,
	};
	testing.mount(FormItemSelectColor, attrs);
	const select = testing.find("#form-item-select-test");
	testing.findAll("#form-item-select-test > option", Object.keys(ColorEnum).length + 1);
	testing.input(select, "blue");
	expect(value)
		.toBe("blue");
});

