import m from "mithril";

import { Drag } from "./Drag";

describe("Drag", () => {
  test("end", () => {
    testing.mount("div", [m("div.drag"), m("div.drag")]);

    expect(testing.findAll(".drag")).toHaveLength(2);

    Drag.end("drag");

    expect(testing.findAll(".drag")).toHaveLength(0);
  });

  test("getTouchXY", () => {
    const touch = new Event("touch") as any;
    touch.changedTouches = [
      {
        clientX: 1,
        clientY: 2,
      },
    ];

    expect(Drag.getTouchXY(touch)).toStrictEqual({
      x: 1,
      y: 2,
    });
  });

  test("isSourceAfter", () => {
    testing.mount("body", m("div#test"));

    const el = testing.find("#test");

    expect(Drag.isSourceAfter(0, el)).toBeFalsy();
    expect(Drag.state.before).toBeTruthy();

    expect(Drag.isSourceAfter(25, el)).toBeTruthy();
    expect(Drag.state.before).toBeFalsy();
  });

  test("moveSrcAfter", () => {
    testing.mount("body", [m("div#test1"), m("div#test2")]);

    const el1 = testing.find("#test1");
    const el2 = testing.find("#test2");

    Drag.moveSrcAfter(el1, el2);

    expect(el2.nextElementSibling).toBe(el1);

    Drag.moveSrcAfter(el2, el1);

    expect(el1.nextElementSibling).toBe(el2);
  });

  test("moveSrcBefore", () => {
    testing.mount("body", [m("div#test1"), m("div#test2")]);

    const el1 = testing.find("#test1");
    const el2 = testing.find("#test2");

    Drag.moveSrcBefore(el2, el1);

    expect(el1.previousElementSibling).toBe(el2);

    Drag.moveSrcBefore(el1, el2);

    expect(el2.previousElementSibling).toBe(el1);
  });

  test("setDragTarget", () => {
    testing.mount("body", m("div#test1"));

    const el = testing.find("#test1");

    Drag.setDragTarget(el, "drag");

    testing.hasClass(el, "drag");

    expect(Drag.state.target).toBe("test1");
  });

  test("start", () => {
    testing.mount("body", [m("div#test1"), m("div#test2")]);

    Drag.state = {
      before: true,
      parent: null,
      position: 100,
      source: "a",
      target: "b",
      x: 0,
      y: 0,
    };

    Drag.start(testing.find("#test2"), "dragging");

    const el = testing.find("#test2");

    expect(Drag.state).toStrictEqual({
      before: false,
      parent: el.parentElement,
      position: 1,
      source: "test2",
      target: "",
      x: 0,
      y: 0,
    });

    testing.hasClass(el, "dragging");
  });
});
