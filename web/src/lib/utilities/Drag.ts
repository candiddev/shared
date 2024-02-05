import type m from "mithril";

export const Drag = {
  /** GetDragEnd retrieves the ending IDs for a drag session. */
  end: (dragTargetClass: string): void => {
    const targets = document.getElementsByClassName(dragTargetClass);

    for (let i = 0; i < targets.length; i++) {
      targets[i].classList.remove(dragTargetClass);
    }
  },
  /** GetTouchXY gets touch coordinates and sets the element up for OnDrag. */
  getTouchXY: (e: m.Event<TouchEvent>): { x: number; y: number } => {
    // eslint-disable-line jsdoc/require-jsdoc
    e.redraw = false;
    e.preventDefault();
    const touches = e.changedTouches[0];

    return {
      x: touches.clientX,
      y: touches.clientY,
    };
  },
  isSourceAfter: (y: number, target: HTMLElement): boolean => {
    Drag.state.before = y < target.getBoundingClientRect().y + 25;

    return !Drag.state.before;
  },
  moveSrcAfter: (src: HTMLElement, target: HTMLElement): void => {
    if (target.nextElementSibling !== src) {
      target.insertAdjacentElement("afterend", src);
    }
  },
  moveSrcBefore: (src: HTMLElement, target: HTMLElement): void => {
    if (target.previousElementSibling !== src) {
      target.insertAdjacentElement("beforebegin", src);
    }
  },
  setDragTarget: (target: HTMLElement, dragTargetClass: string): void => {
    target.classList.add(dragTargetClass);
    Drag.state.target = target.id;
  },
  /** SetXY sets a fallback XY from the body dragover. */
  setXY: (x: number, y: number): void => {
    // eslint-disable-line jsdoc/require-jsdoc
    Drag.state.x = x;
    Drag.state.y = y;
  },
  start: (src: HTMLElement, draggingClass: string): void => {
    Drag.state.before = false;
    Drag.state.parent = src.parentElement;
    Drag.state.position = Array.prototype.indexOf.call(
      (Drag.state.parent as HTMLElement).children,
      src,
    );
    Drag.state.source = src.id;
    Drag.state.target = "";
    src.classList.add(draggingClass);
  },
  state: {
    before: false,
    parent: null as HTMLElement | null,
    position: 0,
    source: "",
    target: "",
    x: 0,
    y: 0,
  },
};
