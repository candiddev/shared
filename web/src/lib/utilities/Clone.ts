export function Clone<T>(object: T): T {
  return JSON.parse(JSON.stringify(object));
}
