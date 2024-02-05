import { AppState } from "../states/App";
import { AppAlerts } from "./AppAlerts";

test("AppAlerts", async () => {
  AppState.data.layoutAppAlerts = [
    {
      actions: [
        {
          name: "Test",
          onclick: async () => {},
        },
      ],
      message: "Testing",
    },
    {
      message: "Testing",
    },
  ];

  testing.mount(AppAlerts);
  testing.findAll(".AppAlerts__alert", 2);
  testing.findAll(".AppAlerts__actions", 1);
});
