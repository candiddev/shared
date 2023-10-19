import { ArrayBufferToBase64 } from "./ArrayBuffer";

export function RandString (length: number): string {
	return ArrayBufferToBase64(crypto.getRandomValues(new Uint8Array(length)))
		.substring(0, length);
}
