import { RandString } from "./RandString";

test("RandString", () => {
	expect(RandString(10))
		.toHaveLength(10);
});
