interface Classes {
  [key: string]: boolean;
}

export function SetClass(classes: Classes): string {
  const s: string[] = [];

  for (const c of Object.entries(classes)) {
    if (c[1]) {
      s.push(c[0]);
    }
  }

  return s.join(" ");
}
