export function MergeArray<T>(array1: T[], array2: T[]): T[] {
  return array1.concat(
    array2.filter((item) => {
      return array1.indexOf(item) < 0;
    }),
  );
}
