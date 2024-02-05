import { Duration } from "./Duration";

describe("Duration", () => {
  test.each([
    ["day", 16000, "11d 2h 40m"],
    ["hour", 60, "1h 0m"],
    ["zero", 0, "0m"],
  ])("fromString: %s", (_name, input, output) => {
    expect(Duration.toString(input)).toBe(output);
  });
});
