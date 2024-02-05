import { Clone } from "@lib/utilities/Clone";
import m from "mithril";

(global as any).testing = {
  click: (element: HTMLElement | Element | string): void => {
    testing.find(element).click();
    testing.redraw();
  },
  find: (query: HTMLElement | Element | string): HTMLElement => {
    if (typeof query !== "string") {
      return query as HTMLElement;
    }

    const e = document.querySelector(query);

    if (e === null) {
      throw new Error(`${query} not in document`);
    }

    return e as HTMLElement;
  },
  findAll: (query: string, number?: number): NodeListOf<HTMLElement> => {
    const all = document.querySelectorAll(query);

    if (number !== undefined && all.length !== number) {
      throw new Error(`got ${all.length}, want ${number}`);
    }

    return all as NodeListOf<HTMLElement>;
  },
  hasAttribute: (
    element: HTMLElement | Element | string,
    key: string,
    value: string,
  ): void => {
    const el = testing.find(element);

    if (`${el.getAttribute(key)}` !== value) {
      throw new Error(
        `got ${key}=${el.getAttribute(key)}, want ${key}=${value}`,
      );
    }
  },
  hasClass: (
    element: HTMLElement | Element | string,
    className: string,
  ): void => {
    const el = testing.find(element);

    if (!el.classList.contains(className)) {
      throw new Error(`${el.classList} does not contain ${className}`);
    }
  },
  hasStyle: (element: HTMLElement | Element | string, style: string): void => {
    const s = testing.find(element).style.cssText;

    if (!s.includes(style)) {
      throw new Error(`${s} does not contain ${style}`);
    }
  },
  input: (element: HTMLElement | Element | string, value: string): void => {
    const el = testing.find(element) as HTMLInputElement;
    el.value = value;
    el.dispatchEvent(
      new InputEvent("input", {
        data: value,
      }),
    );
  },
  logBody: (): void => {
    let indent = 0;
    let output = "";
    for (const word of document.body.innerHTML.split("<")) {
      if (word === "") {
        continue;
      }
      if (word.startsWith("/")) {
        indent--;
      }
      output += `${"  ".repeat(indent)}<${word}\n`;
      if (!word.startsWith("/") && !word.startsWith("br")) {
        indent++;
      }
    }
    console.log(output); // eslint-disable-line no-console
  },
  mocks: {
    boundingClientRecY: 0,
    elementFromPoint: null,
    params: {},
    requests: [],
    responses: [],
    route: "",
    store: {},
  },
  mount: <Attrs, State>(
    component: m.ComponentTypes<Attrs, State>,
    attrs?: Attrs & m.CommonAttributes<Attrs, State>,
    child?: m.Component,
  ): void => {
    m.mount(document.body, {
      view: () => {
        return m(
          component,
          attrs === undefined ? {} : (attrs as any),
          child === undefined ? [] : m(child),
        );
      },
    });
  },
  notFind: (query: string): void => {
    const e = document.querySelector(query);

    if (e !== null) {
      throw new Error(`${query} is in document`); // eslint-disable-line no-restricted-syntax
    }
  },
  notHasClass: (
    element: HTMLElement | Element | string,
    className: string,
  ): void => {
    try {
      testing.hasClass(element, className);
    } catch {
      return;
    }

    throw new Error(`Element has ${className}`);
  },
  notHasStyle: (
    element: HTMLElement | Element | string,
    style: string,
  ): void => {
    const s = testing.find(element).style.cssText;

    if (s.includes(style)) {
      throw new Error(`${s} does contains ${style}`);
    }
  },
  redraw: (): void => {
    return m.redraw.sync();
  },
  requests: (requests: XHRRequest[]): void => {
    expect(testing.mocks.requests).toStrictEqual(Clone(requests));
    testing.mocks.requests = [];
  },
  sleep: async (time: number): Promise<void> => {
    return new Promise((resolve: TimerHandler): void => {
      setTimeout(resolve, time); // eslint-disable-line @typescript-eslint/no-implied-eval
    });
  },
  text: (element: HTMLElement | Element | string, want: string): void => {
    const el = testing.find(element);

    if (el.textContent !== want) {
      throw new Error(`got ${el.textContent}, want ${want}`);
    }
  },
  title: (want: string): void => {
    expect(document.title).toBe(` - ${want}`);
  },
  value: (element: HTMLElement | Element | string, want: string): void => {
    const el = testing.find(element) as HTMLInputElement;

    if (el.value === undefined || `${el.value}` !== want) {
      throw new Error(`got ${el.value}, want ${want}`);
    }
  },
};
