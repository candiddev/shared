import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register();

// https://github.com/capricorn86/happy-dom/issues/527
const originalDispatchEvent = HTMLElement.prototype.dispatchEvent;
HTMLElement.prototype.dispatchEvent = function (event: any): boolean {
  if (event._target === undefined) {
    // This means the event was passed as a non-happy-dom event
    Object.defineProperty(event, "target", {
      value: this,
      writable: false,
    });
  }

  const result = originalDispatchEvent.call(this, event);

  if (
    event.type === "click" &&
    this.tagName === "BUTTON" &&
    this.getAttribute("type") === "submit"
  ) {
    this.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }) as any,
    );
  }
  return result;
};

HTMLInputElement.prototype.reportValidity = function (): boolean {
  if (
    (this as any)._validationMessage !== undefined &&
    (this as any)._validationMessage !== ""
  ) {
    this.dispatchEvent(
      new Event("invalid", {
        bubbles: true,
        cancelable: true,
      }),
    );

    return false;
  }

  return true;
};

Object.defineProperty(HTMLSelectElement.prototype, "value", {
  value: "",
  writable: true,
});

window.location.href = "http://localhost";
