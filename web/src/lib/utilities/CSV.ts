import type { ParseResult } from "papaparse";

import { NewErr } from "../services/Log";

let papaParse: typeof import("papaparse"); // eslint-disable-line @typescript-eslint/consistent-type-imports

export const CSV = {
  getHeaders: async (input: string): Promise<string[]> => {
    const data = await CSV.import(input);

    if (data === null || data.meta.fields === undefined) {
      return [];
    }

    return data.meta.fields;
  },
  import: async (input: string): Promise<ParseResult<unknown> | null> => {
    if (papaParse === undefined) {
      papaParse = await import("papaparse");
    }

    const data = papaParse.parse(
      input
        .split("\n")
        .filter((line) => {
          return line.includes(",");
        })
        .join("\n"),
      {
        header: true,
      },
    );

    if (data.errors.length > 0) {
      data.errors.map((error) => {
        NewErr(`CSV.import error: ${error.message}`);
      });

      return null;
    }

    return data;
  },
};
