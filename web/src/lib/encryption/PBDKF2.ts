import type { Err } from "@lib/services/Log";
import { IsErr, NewErr } from "@lib/services/Log";
import { ArrayBufferToBase64 } from "@lib/utilities/ArrayBuffer";

export async function NewPBDKF2AES128Key(
  password: string,
  salt: string,
): Promise<string | Err> {
  if (crypto.subtle === undefined) {
    return NewErr("WebCrypto not detected");
  }

  let key = await crypto.subtle
    .importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
      "deriveBits",
      "deriveKey",
    ])
    .catch((err) => {
      return NewErr(
        `NewPBDKF2AES128Key: error importing: ${err}`,
        "Error generating key",
      );
    });

  if (IsErr(key)) {
    return key;
  }

  key = await crypto.subtle
    .deriveKey(
      {
        hash: "SHA-256",
        iterations: 100000,
        name: "PBKDF2",
        salt: new TextEncoder().encode(salt),
      },
      key,
      {
        length: 128,
        name: "AES-GCM",
      },
      true,
      ["encrypt", "decrypt"],
    )
    .catch((err) => {
      return NewErr(
        `NewPBDKF2AES128Key: error deriving: ${err}`,
        "Error generating key",
      );
    });

  if (IsErr(key)) {
    return key;
  }

  return ArrayBufferToBase64(await crypto.subtle.exportKey("raw", key));
}
