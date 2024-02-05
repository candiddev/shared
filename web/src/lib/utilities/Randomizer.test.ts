import {
  alphaLower,
  alphaNumber,
  alphaSpecial,
  alphaUpper,
  Randomizer,
} from "./Randomizer";

test("Randomizer", () => {
  expect(
    Randomizer({
      length: 10,
    }),
  ).toHaveLength(10);
  expect(
    new RegExp(`[${alphaLower}]`).test(
      Randomizer({
        length: 10,
        noLower: true,
      }),
    ),
  ).toBeFalsy();
  expect(
    new RegExp(`[${alphaNumber}]`).test(
      Randomizer({
        length: 10,
        noNumber: true,
      }),
    ),
  ).toBeFalsy();
  expect(
    new RegExp(`[${alphaSpecial}]`).test(
      Randomizer({
        length: 10,
        noSpecial: true,
      }),
    ),
  ).toBeFalsy();
  expect(
    new RegExp(`[${alphaUpper}]`).test(
      Randomizer({
        length: 10,
        noUpper: true,
      }),
    ),
  ).toBeFalsy();
});
