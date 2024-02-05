import type { Err } from "@lib/services/Log";
import m from "mithril";

export type IconName = string; // eslint-disable-line @typescript-eslint/no-type-alias

export interface IconAttrs {
  /** Space separated classes to add to the icon. */
  classes?: string;

  /** Mark icon as draggable. */
  draggable?: boolean;

  /** Icon to display. */
  icon?: IconName;

  /** Optional ID. */
  id?: string;

  onclick?(e: m.Event<MouseEvent>): Promise<void | Err>;
  ondrag?(e: m.Event<DragEvent>): void;
  ondragend?(): Promise<void | Err>;
  ondragstart?(e: m.Event<DragEvent>): Promise<void | Err>;
  ontouchend?(): Promise<void | Err>;
  ontouchmove?(e: m.Event<TouchEvent>): Promise<void | Err>;
  ontouchstart?(): Promise<void | Err>;

  /** Additional styles to add. */
  style?: object;
}

export function Icon(): m.Component<IconAttrs> {
  return {
    view: (vnode): m.Vnode => {
      return m(
        "i.notranslate",
        {
          class: vnode.attrs.classes,
          draggable: vnode.attrs.draggable,
          id: vnode.attrs.id,
          onclick: vnode.attrs.onclick,
          ondrag: vnode.attrs.ondrag,
          ondragend: vnode.attrs.ondragend,
          ondragstart: vnode.attrs.ondragstart,
          ontouchend: vnode.attrs.ontouchend,
          ontouchmove: vnode.attrs.ontouchmove,
          ontouchstart: vnode.attrs.ontouchstart,
          style: vnode.attrs.style,
          translate: "no",
        },
        vnode.attrs.icon,
      );
    },
  };
}
