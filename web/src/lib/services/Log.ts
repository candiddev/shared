export interface Err {
  /** Text for logging. */
  error: string;

  /** Text for displaying to a user. */
  message: string;
}

export function IsErr(value: unknown): value is Err {
  return typeof value === "object" && value !== null && "error" in value;
}

export function NewErr(error: string, message?: string): Err {
  console.groupCollapsed(`[ERROR] ${error}`); // eslint-disable-line no-console
  console.trace(); // eslint-disable-line no-console
  console.groupEnd(); // eslint-disable-line no-console

  return {
    error: error,
    message: message === undefined ? "" : message,
  };
}

export const Log = {
  debug: (message: string): void => {
    if (process.env.NODE_ENV === "development") {
      console.groupCollapsed(`[DEBUG] ${message}`); // eslint-disable-line no-console
      console.trace(); // eslint-disable-line no-console
      console.groupEnd(); // eslint-disable-line no-console
    }
  },
};
