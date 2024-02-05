import crypto from "crypto";
import m from "mithril";

document.elementFromPoint = (): Element | null => {
  return testing.mocks.elementFromPoint;
};

Object.defineProperty(global, "PaymentRequest", {
  value: vi.fn().mockImplementation(() => {
    return {
      show: async (): Promise<PaymentResponse> => {
        return new Promise((resolve) => {
          return resolve({
            complete: async (): Promise<void> => {
              return new Promise((resolve) => {
                return resolve();
              });
            },
            details: {
              purchaseToken: "token",
            },
          } as PaymentResponse);
        });
      },
    };
  }),
  writable: true,
});

Object.defineProperty(global, "crypto", {
  value: {
    getRandomValues: (arr: any) => {
      return crypto.randomBytes(arr.length);
    },
    subtle: (crypto.webcrypto as any).subtle,
  },
});

Object.defineProperty(window, "matchMedia", {
  value: vi.fn().mockImplementation((query) => {
    return {
      addEventListener: vi.fn(),
      addListener: vi.fn(), // deprecated
      dispatchEvent: vi.fn(),
      matches: true,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(), // deprecated
    };
  }),
  writable: true,
});

m.route.get = (): string => {
  return testing.mocks.route;
};

m.route.param = (): any => {
  if (testing.mocks.params === undefined) {
    return {};
  }
  return testing.mocks.params; // eslint-disable-line
};

m.route.set = (route: string, params: object): void => {
  testing.mocks.route = route;
  if (params !== undefined && params !== null) {
    testing.mocks.params = params;
  }
};

vi.mock("chart.js", async (importOriginal) => {
  const actual = await importOriginal();

  const chart = vi.fn() as any;
  chart.defaults = {
    datasets: {
      doughnut: {},
      line: {},
    },
    plugins: {
      datalabels: undefined,
    },
  };

  chart.prototype.destroy = vi.fn();
  chart.register = vi.fn();

  return {
    ...(actual as any),
    Chart: chart,
  };
});

global.window.Element.prototype.getBoundingClientRect = (): DOMRect => {
  return {
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    toJSON: (): void => {},
    top: 0,
    width: 0,
    x: 0,
    y: testing.mocks.boundingClientRecY,
  };
};

const localStorageMock = ((): object => {
  return {
    getItem: (key: string): string | null => {
      if (testing.mocks.store[key] === undefined) {
        return null;
      }
      return testing.mocks.store[key];
    },
    key: (key: number): string | null => {
      return Object.keys(testing.mocks.store)[key];
    },
    get length(): number {
      return Object.keys(testing.mocks.store).length;
    },
    removeItem: (key: string): void => {
      delete testing.mocks.store[key];
    },
    setItem: (key: string, value: object): void => {
      testing.mocks.store[key] = value.toString(); // eslint-disable-line @typescript-eslint/no-base-to-string
    },
  };
})();

global.localStorage = localStorageMock as any;

vi.mock("nosleep.js");
