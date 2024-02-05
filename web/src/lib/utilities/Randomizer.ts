export const alphaLower = "abcdefghijklmnopqrstuvwxyz";
export const alphaNumber = "0123456789";
export const alphaSpecial = "!@#$%^&*";
export const alphaUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export interface RandomizerOptions {
  /** Length of string to generate. */
  length: number;

  /** Don't use lowercase. */
  noLower?: boolean;

  /** Don't use numbers. */
  noNumber?: boolean;

  /** Don't use special characters. */
  noSpecial?: boolean;

  /** Don't use upper characters. */
  noUpper?: boolean;
}

const max = Math.pow(2, 8);

export function Randomizer(opts: RandomizerOptions): string {
  const alpha = `${opts.noLower === true ? "" : alphaLower}${
    opts.noNumber === true ? "" : alphaNumber
  }${opts.noSpecial === true ? "" : alphaSpecial}${
    opts.noUpper === true ? "" : alphaUpper
  }`;

  const array = new Uint8Array(1);
  let result = "";

  for (let i = 0; i < opts.length; i++) {
    result += alpha.charAt(
      Math.floor((crypto.getRandomValues(array)[0] / max) * alpha.length),
    ); // eslint-disable-line @typescript-eslint/no-extra-parens
  }

  return result;
}
