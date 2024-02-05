import type m from "mithril";

export enum Animation {
  Expand,
  Fade,
  FromBottom,
  FromLeft,
  FromRight,
  FromTop,
  Pulse,
  Spin,
}

export const Animate = {
  class: (a: Animation): string => {
    return `animation${Animation[a]}Add`;
  },
  onbeforeremove: (
    a: Animation,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): ((v: m.VnodeDOM<any, any>) => Promise<void>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (v: m.VnodeDOM<any, any>) => {
      v.dom.classList.remove(`animation${Animation[a]}Add`);
      v.dom.classList.add(`animation${Animation[a]}Remove`);

      return new Promise<void>((resolve) => {
        if (process.env.NODE_ENV === "test") {
          return resolve();
        }

        v.dom.addEventListener("animationend", () => {
          return resolve();
        });

        return;
      });
    };
  },
};
