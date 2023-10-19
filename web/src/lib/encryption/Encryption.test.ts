import { IsErr } from "@lib/services/Log";

import type { EncryptionType, Key, KeyType } from "./Encryption";
import { EncryptionTypeAES128GCM, EncryptionTypeNone, EncryptionTypeRSA2048OAEP, KeyTypeAES128, KeyTypeNone, KeyTypeRSA2048Private, KeyTypeRSA2048Public, NewKey } from "./Encryption";

test.each([
	[
		"unknown" as KeyType,
		true,
		EncryptionTypeNone,
	],
	[
		KeyTypeNone,
		false,
		EncryptionTypeNone,
	],
	[
		KeyTypeAES128,
		false,
		EncryptionTypeAES128GCM,
	],
	[
		KeyTypeRSA2048Private,
		false,
		EncryptionTypeRSA2048OAEP,
	],
	[
		KeyTypeRSA2048Public,
		false,
		EncryptionTypeRSA2048OAEP,
	],
])("Key %s", async (keyType: KeyType, wantErr: boolean, wantEncryptionType: EncryptionType) => {
	const k = await NewKey(keyType);
	expect(IsErr(k))
		.toBe(wantErr === true);

	if (IsErr(k)) {
		expect(wantErr)
			.toBeTruthy();
	} else {
		let decrypt: Key | undefined;
		let encrypt: Key | undefined;

		switch (keyType) {
		case KeyTypeAES128:
			encrypt = k.key;
			decrypt = k.key;
			break;
		case KeyTypeNone:
			encrypt = k.key;
			decrypt = k.key;
			break;
		case KeyTypeRSA2048Private:
		case KeyTypeRSA2048Public:
			encrypt = k.publicKey;
			decrypt = k.privateKey;
			keyType = KeyTypeRSA2048Private; // eslint-disable-line no-param-reassign
			break;
		}

		if (encrypt === undefined) {
			throw"encrypt key is undefined"; // eslint-disable-line
		} else if (decrypt === undefined) {
			throw"decrypt key is undefined"; //eslint-disable-line
		}

		expect(decrypt.type)
			.toBe(keyType);

		const out = await encrypt.encrypt("hello");

		if (IsErr(out)) {
			expect.fail(`encrypt had error: ${out.error}`);
		}

		expect(out.keyID)
			.toBe(encrypt.id);
		expect(out.encryption)
			.toBe(wantEncryptionType);
		expect(await decrypt.decrypt(out))
			.toBe("hello");
	}
});
