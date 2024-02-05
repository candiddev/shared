declare global {
  namespace NodeJS {
    interface Global {
      testing: {
        click(query: HTMLElement | Element | string): void;
        find(query: HTMLElement | Element | string): HTMLElement;
        findAll(query: string, number?: number): NodeListOf<HTMLElement>;
        hasAttribute(
          element: HTMLElement | Element | string,
          key: string,
          value: string,
        ): void;
        hasClass(
          element: HTMLElement | Element | string,
          className: string,
        ): void;
        hasStyle(element: HTMLElement | Element | string, style: string): void;
        input(element: HTMLElement | Element | string, want: string): void;
        logBody(): void;
        mocks: {
          boundingClientRecY: number;
          elementFromPoint: Element | null;
          params: any;
          requests: XHRRequest[];
          responses: XHRResponse[];
          route: string;
          store: any;
        };
        mount<Attrs, State>(
          component: m.ComponentTypes<Attrs, State>,
          attrs?: Attrs & m.CommonAttributes<Attrs, State>, // eslint-disable-line @typescript-eslint/no-redundant-type-constituents
          child?: m.Component,
        ): void;
        notFind(query: string): void;
        notHasClass(
          element: HTMLElement | Element | string,
          className: string,
        ): void;
        notHasStyle(
          element: HTMLElement | Element | string,
          style: string,
        ): void;
        redraw(): void;
        requests(requsts: XHRRequest[]): void;
        sleep(time: number): Promise<void>;
        text(element: HTMLElement | Element | string, want: string): void;
        title(want: string): void;
        value(element: HTMLElement | Element | string, want: string): void;
      };
    }
  }
}

declare const testing: {
  click(query: HTMLElement | Element | string): void;
  find(query: HTMLElement | Element | string): HTMLElement;
  findAll(query: string, number?: number): NodeListOf<HTMLElement>;
  hasAttribute(
    element: HTMLElement | Element | string,
    key: string,
    value: string,
  ): void;
  hasClass(element: HTMLElement | Element | string, className: string): void;
  hasStyle(element: HTMLElement | Element | string, style: string): void;
  input(element: HTMLElement | Element | string, want: string): void;
  logBody(): void;
  mocks: {
    boundingClientRecY: number;
    elementFromPoint: Element | null;
    params: any;
    requests: XHRRequest[];
    responses: XHRResponse[];
    route: string;
    store: any;
  };
  mount<Attrs, State>(
    component: m.ComponentTypes<Attrs, State>,
    attrs?: Attrs & m.CommonAttributes<Attrs, State>, // eslint-disable-line @typescript-eslint/no-redundant-type-constituents
    child?: m.Component,
  ): void;
  notFind(query: string): void;
  notHasClass(element: HTMLElement | Element | string, className: string): void;
  notHasStyle(element: HTMLElement | Element | string, style: string): void;
  redraw(): void;
  requests(requsts: XHRRequest[]): void;
  sleep(time: number): Promise<void>;
  text(element: HTMLElement | Element | string, want: string): void;
  title(want: string): void;
  value(element: HTMLElement | Element | string, want: string): void;
};

interface XHRResponse {
  dataHash?: string;
  dataIDs?: APIResponseDataID[];
  dataTotal?: number;
  dataType?: string;
  dataValue?: any[];
  message?: string;
  status?: number;
  success?: boolean;
}

interface XHRRequest {
  body?: unknown;
  hash?: string;
  method: string;
  path: string;
  updated?: NullString;
}
