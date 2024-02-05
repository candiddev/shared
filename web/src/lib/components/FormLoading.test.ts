import { FormLoading } from "./FormLoading";

test("FormLoading", async () => {
  testing.mount(FormLoading);
  testing.find("#form-loading.FormLoading");
  testing.findAll("span", 6);
});
