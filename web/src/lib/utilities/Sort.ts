/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SortArgs {
  /** Optional formatter function to run during sorting. */
  formatter?(object: any): boolean | number | string; // eslint-disable-line @typescript-eslint/no-explicit-any

  /** Invert the sort results. */
  invert?: boolean;

  /** Property to sort by.  Omit this to sort non-object arrays. */
  property?: string;
}

export function Sort(state: any[] | null, args?: SortArgs): void {
  if (state !== null) {
    state.sort((a, b): number => {
      let testA;
      let testB;

      if (
        args !== undefined &&
        args.formatter === undefined &&
        typeof a === "object" &&
        typeof b === "object"
      ) {
        if (
          args !== undefined &&
          args.property !== undefined &&
          a[args.property] !== undefined
        ) {
          testA = a[args.property];
        }

        if (
          args !== undefined &&
          args.property !== undefined &&
          b[args.property] !== undefined
        ) {
          testB = b[args.property];
        }
      } else if (args !== undefined && args.formatter !== undefined) {
        testA = args.formatter(a);
        testB = args.formatter(b);
      } else {
        testA = a;
        testB = b;
      }

      if (testA === testB) {
        return 0;
      }

      if (testA === null || testA === undefined || testA === "") {
        return 1;
      }

      if (testB === null || testB === undefined || testB === "") {
        return -1;
      }

      if (args !== undefined && args.invert === true) {
        if (testA < testB) {
          return 1;
        }

        return -1;
      }

      if (testA > testB) {
        return 1;
      }

      return -1;
    });
  }
}
