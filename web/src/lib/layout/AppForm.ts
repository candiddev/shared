import type { FormOverlayComponentAttrs } from "@lib/components/FormOverlay";
import m from "mithril";

import { AppState } from "../states/App";

export interface AppFormSettings {
  /** Component to render in AppForm. */
  component: (() => m.Component<FormOverlayComponentAttrs<any>>) | null; // eslint-disable-line @typescript-eslint/no-explicit-any

  /** Data to pass to component in AppForm. */
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface AppFormComponentAttrs<T> {
  /** Data passed to the component. */
  data: T;
}

export function AppForm(): m.Component {
  return {
    view: (): m.Children => {
      return AppState.getLayoutAppForm().component === null
        ? []
        : m(
            AppState.getLayoutAppForm().component as () => m.Component<
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              FormOverlayComponentAttrs<any>
            >,
            {
              data: AppState.getLayoutAppForm().data,
            },
          );
    },
  };
}
