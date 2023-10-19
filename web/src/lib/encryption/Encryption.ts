import type { Err } from "@lib/services/Log";
import { IsErr, NewErr } from "@lib/services/Log";
import { ArrayBufferToBase64, ArrayBufferToString, Base64ToArrayBuffer, StringToArrayBuffer } from "@lib/utilities/ArrayBuffer";

import { aes128GCMDecrypt, aes128GCMEncrypt,NewAES128Key } from "./AES128";
import { NewRSA2048Key, rsa2048OAEPDecrypt, rsa2048OAEPEncrypt } from "./RSA2048";

export type EncryptionType = string; // eslint-disable-line @typescript-eslint/no-type-alias
export type KeyType = string; // eslint-disable-line @typescript-eslint/no-type-alias

export const KeyTypeAES128 = "aes128" as KeyType;
export const KeyTypeNone = "none" as KeyType;
export const KeyTypeRSA2048Public = "rsa2048public" as KeyType;
export const KeyTypeRSA2048Private = "rsa2048private" as KeyType;
export const EncryptionTypeNone = "none" as EncryptionType;
export const EncryptionTypeAES128GCM = "aes128gcm" as EncryptionType;
export const EncryptionTypeRSA2048OAEP = "rsa2048oaepsha256" as EncryptionType;

export class EncryptedValue {
	ciphertext: string;
	encryption: EncryptionType;
	keyID: string = "";

	constructor (encryption: EncryptionType, ciphertext: string, keyID: string) {
		this.ciphertext = ciphertext;
		this.encryption = encryption;
		this.keyID = keyID;
	}

	string (): string {
		let out = `${this.encryption}:${this.ciphertext}`;
		if (this.keyID !== "") {
			out += `:${this.keyID}`;
		}

		return out;
	}
}

export class Key {
	id: string = "";
	key: string;
	type: KeyType;

	constructor (type: KeyType, key: string, id: string) {
		this.type = type;
		this.id = id;
		this.key = key;
	}

	async encrypt (input: string): Promise<EncryptedValue | Err> {
		let c: string | Err = "";
		let t: EncryptionType = "";

		switch (this.type) {
		case KeyTypeNone:
			c = ArrayBufferToBase64(StringToArrayBuffer(input));
			t = EncryptionTypeNone;
			break;
		case KeyTypeAES128:
			c = await aes128GCMEncrypt(this.key, input);
			t = EncryptionTypeAES128GCM;
			break;
		case KeyTypeRSA2048Public:
			c = await rsa2048OAEPEncrypt(this.key, input);
			t = EncryptionTypeRSA2048OAEP;
			break;
		}

		if (IsErr(c)) {
			return c;
		}

		if (c === "" || t === "") {
			return NewErr("EncryptValue: unknown encryption", "Error encrypting value");
		}

		return new EncryptedValue(t, c, this.id);
	}

	async decrypt (input: EncryptedValue): Promise<string | Err> {
		switch (input.encryption) {
		case EncryptionTypeNone:
			return ArrayBufferToString(Base64ToArrayBuffer(input.ciphertext));
		case EncryptionTypeAES128GCM:
			return aes128GCMDecrypt(this.key, input.ciphertext);
		case EncryptionTypeRSA2048OAEP:
			return rsa2048OAEPDecrypt(this.key, input.ciphertext);
		}


		return NewErr("decrypt: unknown encryption", "Error decrypting value");
	}

	string (): string {
		let out = `${this.type}:${this.key}`;
		if (this.id !== "") {
			out += `:${this.id}`;
		}

		return out;
	}
}

export async function NewKey (type: KeyType): Promise<({
	key?: Key,
	privateKey?: Key,
	publicKey?: Key,
} | Err)> {
	let id = "";
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < 10) {
		id += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}


	switch (type) {
	case KeyTypeNone:
		return {
			key: new Key(type, "", id),
		};
	case KeyTypeAES128:
		const a = await NewAES128Key();
		if (IsErr(a)) {
			return a;
		}

		return {
			key: new Key(type, a, id),
		};
	case KeyTypeRSA2048Private:
	case KeyTypeRSA2048Public:
		const r = await NewRSA2048Key();
		if (IsErr(r)) {
			return r;
		}

		return {
			privateKey: new Key(KeyTypeRSA2048Private, r.privateKey, id),
			publicKey: new Key(KeyTypeRSA2048Public, r.publicKey, id),
		};
	}

	return NewErr("NewKey: unknown encryption", "Error generating key");
}

export function ParseEncryptedValue (value: string): EncryptedValue | Err {
	const r = value.split(":");

	let e = "";
	let i = "";

	switch (r[0]) {
	case EncryptionTypeAES128GCM:
		e = EncryptionTypeAES128GCM;
		break;
	case EncryptionTypeNone:
		e = EncryptionTypeNone;
		break;
	case EncryptionTypeRSA2048OAEP:
		e = EncryptionTypeRSA2048OAEP;
		break;
	}

	if (r.length === 3) {
		i = r[2];
	}

	if (e !== "") {
		return new EncryptedValue(e, r[1], i);
	}

	return NewErr("ParseEncryptedValue: unknown encryption", "Error reading encrypted value");
}

export function ParseKey (s: string): Key | Err {
	const r = s.split(":");

	let i = "";
	let t = "";

	if (r.length === 2 || r.length === 3) {
		switch (r[0]) {
		case KeyTypeNone:
			t = KeyTypeNone;
			break;
		case KeyTypeAES128:
			t = KeyTypeAES128;
			break;
		case KeyTypeRSA2048Private:
			t = KeyTypeRSA2048Private;
			break;
		case KeyTypeRSA2048Public:
			t = KeyTypeRSA2048Public;
			break;
		}

		if (r.length === 3) {
			i = r[2];
		}

		if (t !== "") {
			return new Key(t, r[1], i);
		}

	}

	return NewErr("ParseKey: unknown key type", "Error reading key");
}
