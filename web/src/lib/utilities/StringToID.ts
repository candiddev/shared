export function StringToID(
  input: string | undefined,
  noPrepend?: boolean,
): string {
  if (input === undefined) {
    return "";
  }
  const n = `${noPrepend === true ? "" : "-"}${input}`;
  return n
    .toLowerCase()
    .replace(/\n| |\//g, "-")
    .replace(/\.|\$|#-|!|#|\?|:|'|,|\+|\(|\)/g, "");
}
