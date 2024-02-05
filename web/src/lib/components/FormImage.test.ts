import { FormImage } from "./FormImage";

test("FormImage", () => {
  let something = false;

  const attrs = {
    name: "test",
    onclick: () => {
      something = true;
    },
    oninput: (): void => {},
    text: "Some Text",
    value: "aa",
  };
  testing.mount(FormImage, attrs);
  testing.find("#form-image-label-test");
  testing.find("#form-image-input-test");
  testing.click("#form-image-test");
  testing.text("#form-image-text-test", "Some Text");

  expect(something).toBeTruthy();
});
