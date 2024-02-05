import { NoImage } from "./NoImage";

test("NoImage", async () => {
  testing.mount(NoImage, {});
  const image = testing.findAll(".NoImage", 1);
  testing.text(image[0], "No Image");
});
