import type { Err } from "@lib/services/Log";
import { IsErr, NewErr } from "@lib/services/Log";
import { ArrayBufferToBase64, Base64ToArrayBuffer } from "@lib/utilities/ArrayBuffer";

export async function NewRSA2048Key (): Promise<{privateKey: string, publicKey: string,} | Err> { // eslint-disable-line jsdoc/require-jsdoc
	const key = await crypto.subtle.generateKey({
		hash: "SHA-256",
		modulusLength: 2048,
		name: "RSA-OAEP",
		publicExponent: new Uint8Array([
			1,
			0,
			1,
		]),
	},
	true,
	[
		"encrypt",
		"decrypt",
	])
		.catch((err) => {
			return NewErr(`NewRSAKey: ${err}`, "Error creating key");
		});

	if (IsErr(key)) {
		return key;
	}

	return {
		privateKey: ArrayBufferToBase64(await crypto.subtle.exportKey("pkcs8", key.privateKey)),
		publicKey: ArrayBufferToBase64(await crypto.subtle.exportKey("spki", key.publicKey)),
	};
}

export async function importRSA2048Key (key: string, publicKey?: boolean): Promise<CryptoKey | Err> {
	return crypto.subtle.importKey(publicKey === true ?
		"spki" :
		"pkcs8", Base64ToArrayBuffer(key), {
		hash: "SHA-256",
		name: "RSA-OAEP",
	},
	true,
	[
		publicKey === true ?
			"encrypt" :
			"decrypt",
	])
		.catch((err) => {
			return NewErr(`importRSAKey: ${err}`, "Error importing key");
		});
}

export async function rsa2048OAEPEncrypt (publicKey: string, input: string): Promise<string | Err> {
	const key = await importRSA2048Key(publicKey, true);

	if (IsErr(key)) {
		return key;
	}

	const enc = await crypto.subtle.encrypt({
		name: "RSA-OAEP",
	}, key, new TextEncoder()
		.encode(input))
		.catch((err) => {
			return NewErr(`rsaEncrypt: ${err}`, "Error encrypting value");
		});

	if (IsErr(enc)) {
		return enc;
	}

	return ArrayBufferToBase64(enc);
}

export async function rsa2048OAEPDecrypt (privateKey: string, input: string): Promise<string | Err> {
	const key = await importRSA2048Key(privateKey);

	if (IsErr(key)) {
		return key;
	}

	const enc = await crypto.subtle.decrypt({
		name: "RSA-OAEP",
	}, key, Base64ToArrayBuffer(input))
		.catch((err) => {
			return NewErr(`rsaDecrypt: ${err}`, "Error decrypting value");
		});

	if (IsErr(enc)) {
		return enc;
	}

	return new TextDecoder()
		.decode(enc);
}
