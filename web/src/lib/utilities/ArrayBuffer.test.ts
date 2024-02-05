import {
  ArrayBufferToBase64,
  ArrayBufferToString,
  Base64ToArrayBuffer,
  StringToArrayBuffer,
} from "./ArrayBuffer";

test("ArrayBuffer", () => {
  const input = "testing";

  let ab = StringToArrayBuffer(input);
  const b64 = ArrayBufferToBase64(ab);
  ab = Base64ToArrayBuffer(b64);

  expect(ArrayBufferToString(ab)).toBe(input);
});
