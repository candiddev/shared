import { aes128GCMDecrypt, aes128GCMEncrypt, NewAES128Key } from "./AES128";

test("AES128", async () => {
	const key = await NewAES128Key() as string;

	expect(key.length)
		.toBe(Math.ceil(16/3) * 4);

	const input = "testing";

	let output = await aes128GCMEncrypt(key, input) as string;
	expect(output)
		.toHaveLength(Math.ceil((input.length + 12 + 4 + 12)/3) * 4); // IV + counter + append IV


	output = await aes128GCMDecrypt(key, output) as string;
	expect(output)
		.toBe(input);

	// Test Go outputs
	const goKey = "9/dd0iJw0TWcg9szIWefsA==";
	const goOutput = "tyOOaSfO6K3bx6lEVikbX7fAnIok3bu1Y9HXNPUZf3kLo3I=";

	output = await aes128GCMEncrypt(goKey, input) as string;
	expect(output)
		.toHaveLength(Math.ceil((input.length + 12 + 4 + 12)/3) * 4); // IV + counter + append IV

	output = await aes128GCMDecrypt(goKey, output) as string;
	expect(output)
		.toBe(input);

	output = await aes128GCMDecrypt(goKey, goOutput) as string;
	expect(output)
		.toBe(input);
});
