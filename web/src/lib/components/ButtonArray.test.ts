import { Icons } from "../types/Icons";
import { ButtonArray } from "./ButtonArray";

describe("ButtonArray", () => {
	test("single", async () => {
		let selected = [] as string[];

		testing.mount(ButtonArray, {
			icon: Icons.Bookmark,
			name: "test",
			onclick: (value: string) => {
				selected = [
					value,
				];
			},
			selected: () => {
				return selected;
			},
			value: [
				{
					color: "black",
					id: "a",
					name: "a",
				},
				"b",
				"c",
			],
			valueLinkPrefix: "/test/",
		});

		testing.findAll("#button-array-test > a", 3);
		testing.text("#button-array-test > a", `${Icons.Bookmark}a`);
		testing.hasAttribute("#button-array-test > a", "href", "#!/test/a");
		testing.notHasClass("#button-array-test > a", "ButtonArray__selected");
		testing.click("#button-array-test-a");
		testing.hasClass("#button-array-test > a", "ButtonArray__selected");
		expect(selected[0])
			.toBe("a");
	});

	test("multi + icons", async () => {
		const value = [
			"a",
			"b",
			"c",
		];

		testing.mount(ButtonArray, {
			name: "test",
			value: value,
		});

		testing.findAll("#button-array-test > p", 3);
		testing.click("#button-array-test-b");
		testing.findAll("#button-array-test > p", 2);
		expect(value)
			.toStrictEqual([
				"a",
				"c",
			]);
	});
});
