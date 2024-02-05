import { Clone } from "./Clone";

export function PushPopStringArray(item: NullUUID, array: string[]): string[] {
  const arr = Clone(array);

  if (item !== null) {
    if (arr.includes(item)) {
      const i = arr.indexOf(item);
      arr.splice(i, 1);
    } else {
      arr.push(item);
    }
  }

  return arr;
}
