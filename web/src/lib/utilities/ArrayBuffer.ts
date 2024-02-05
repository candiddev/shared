export function ArrayBufferToString(b: ArrayBuffer): string {
  return String.fromCharCode(...new Uint8Array(b));
}

export function ArrayBufferToBase64(b: ArrayBuffer): string {
  return btoa(ArrayBufferToString(b));
}

export function Base64ToArrayBuffer(s: string): ArrayBuffer {
  return StringToArrayBuffer(atob(s));
}

export function StringToArrayBuffer(s: string): ArrayBuffer {
  return Uint8Array.from(s, (c) => {
    return c.charCodeAt(0);
  });
}
