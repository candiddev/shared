import { Timestamp } from "../types/Timestamp";
import { FormOverlay } from "./FormOverlay";

test("AppForm", async () => {
  const data = {
    authHouseholdID: "null",
    created: Timestamp.now().toString(),
    id: "1" as NullUUID,
    name: "a",
    updated: Timestamp.now().toString(),
  };

  const c = vi.fn(async () => {
    return Promise.resolve();
  });
  const d = vi.fn(async () => {
    return Promise.resolve();
  });
  const u = vi.fn(async () => {
    return Promise.resolve();
  });

  const attrs = {
    buttons: [
      {
        name: "Copy",
        onclick: async (): Promise<void> => {
          return new Promise((resolve) => {
            data.id = null;

            return resolve();
          });
        },
        permitted: true,
        requireOnline: true,
      },
    ],
    data: data,
    name: "Data",
    onDelete: async () => {
      return d();
    },
    onSubmit: async () => {
      if (data.id === null) {
        return c();
      }

      return u();
    },
    permitted: true,
  };

  testing.mount(FormOverlay, attrs);

  // Buttons
  testing.find("#form-update-data");
  testing.click("#button-delete");
  testing.click("#button-confirm-delete");
  await testing.sleep(100);
  expect(d).toHaveBeenCalledTimes(1);
  testing.click("#button-cancel");
  testing.click("#button-update");
  await testing.sleep(100);
  expect(u).toHaveBeenCalledTimes(1);
  testing.click("#button-copy");
  expect(data.id).toBeNull();
  testing.click("#button-add");
  await testing.sleep(100);
  expect(c).toHaveBeenCalledTimes(1);

  // Inputs
  testing.text(
    "#form-item-input-created",
    Timestamp.now().toPrettyString(0, 0, false),
  );
  testing.text(
    "#form-item-input-last-updated",
    Timestamp.now().toPrettyString(0, 0, false),
  );
});
