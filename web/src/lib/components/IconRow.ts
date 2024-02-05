import "./IconRow.css";

import m from "mithril";

export interface IconRowAttrs {
  /** Icon buttons for the IconRow. */
  icons: IconRowAttrsButton[];
}

export interface IconRowAttrsButton {
  /** Icon to use for the IconRow button. */
  icon: string;

  /** ID of the Icon. */
  id?: string;
  onclick(): void;

  /** Is the icon visible? */
  visible?: boolean;
}

export function IconRow(): m.Component<IconRowAttrs> {
  return {
    view: (vnode): m.Children => {
      return m("div.IconRow", [
        vnode.attrs.icons.map((icon) => {
          if (icon.visible === false) {
            return [];
          }

          return m(
            "div",
            {
              id: icon.id,
              onclick: (e: MouseEvent): void => {
                e.stopPropagation();
                icon.onclick();
              },
            },
            m("i.GlobalButtonIcon", icon.icon),
          );
        }),
      ]);
    },
  };
}
