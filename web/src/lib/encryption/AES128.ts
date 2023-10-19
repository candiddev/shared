import type { Err } from "@lib/services/Log";
import { IsErr, NewErr } from "@lib/services/Log";
import { ArrayBufferToBase64, Base64ToArrayBuffer } from "@lib/utilities/ArrayBuffer";

async function importAES128Key (key: string): Promise<CryptoKey> {
	return crypto.subtle.importKey("raw", Base64ToArrayBuffer(key), "AES-GCM", true, [
		"encrypt",
		"decrypt",
	]);
}

export async function NewAES128Key (): Promise<string | Err> {
	const key = await crypto.subtle.generateKey({
		length: 128,
		name: "AES-GCM",
	},
	true,
	[
		"encrypt",
		"decrypt",
	])
		.catch((err) => {
			return NewErr(`NewAESKey: ${err}`, "Error generating key");
		});

	if (IsErr(key)) {
		return key;
	}

	const b = await crypto.subtle.exportKey("raw", key);

	return ArrayBufferToBase64(b);
}

export async function aes128GCMEncrypt (key: string, input: string): Promise<string | Err> {
	const aes = await importAES128Key(key);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const enc = await crypto.subtle.encrypt({
		iv: iv,
		name: "AES-GCM",
	}, aes, new TextEncoder()
		.encode(input))
		.catch((err) => {
			return NewErr(`aesEncrypt: ${err}`, "Error encrypting value");
		});

	if (IsErr(enc)) {
		return enc;
	}

	if (enc === undefined) {
		return "";
	}

	const output = new Uint8Array(iv.byteLength + enc.byteLength);
	output.set(new Uint8Array(iv), 0);
	output.set(new Uint8Array(enc), iv.byteLength);

	return ArrayBufferToBase64(output);
}

export async function aes128GCMDecrypt (key: string, input: string): Promise<string | Err> {
	const aes = await importAES128Key(key);
	const enc = Base64ToArrayBuffer(input);
	const iv = enc.slice(0, 12);
	const encText = enc.slice(12);

	const dec = await crypto.subtle.decrypt({
		iv: iv,
		name: "AES-GCM",
	}, aes, encText)
		.catch((err) => {
			return NewErr(`aesDecrypt: ${err}`, "Error decrypting value");
		});

	if (IsErr(dec)) {
		return dec;
	}

	if (dec === undefined) {
		return "";
	}

	return new TextDecoder()
		.decode(dec);
}
