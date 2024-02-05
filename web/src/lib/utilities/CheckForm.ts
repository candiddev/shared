export function CheckForm(formID: string): boolean {
  const formEl = document.getElementById(
    `form${
      formID === "" // eslint-disable-line @typescript-eslint/consistent-type-assertions
        ? ""
        : `-${formID}`
    }`,
  ) as HTMLFormElement;
  return formEl.checkValidity();
}
