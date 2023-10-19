import { aes128GCMDecrypt, aes128GCMEncrypt } from "@lib/encryption/AES128";

import { NewPBDKF2AES128Key } from "./PBDKF2";

test("PBDKF2", async () => {
	const key = await NewPBDKF2AES128Key("password", "12345") as string;
	expect(key)
		.toBe("Zg8nzLfVZ6/wDjDFgIXWew==");

	expect(await aes128GCMDecrypt(key, await aes128GCMEncrypt(key, "secret") as string))
		.toBe("secret");
});
