import { Form } from "@lib/components/Form";
import { AppState } from "@lib/states/App";

import { AppForm } from "./AppForm";

test("AppForm", async () => {
  testing.mount(AppForm);
  testing.notFind("#form");
  AppState.setLayoutAppForm(Form as any, {
    data: {
      id: "1",
    },
  });
  await testing.sleep(100);
  testing.find("#form");
});
