import Point2 from "./Point2";
import Vector2 from "./Vector2";
import Obj from "./Object";
import { generateStage, generateObj } from "./spec-helper";
describe("Object", () => {
  let o: Obj;
  beforeEach(() => {
    o = generateObj(generateStage());
  });

  it("decrements its own health when hit", () => {
    const o2 = new Obj(new Point2(0, 0), o.stage, [new Point2()]);
    const preObjHealth = o.health;
    o.onHit({ other: o2, normal: new Vector2() });
    expect(preObjHealth - 10).toBe(o.health);
  });

  describe("highlight", () => {
    it("highlights for a limited time without leaking timers", () => {
      const timers = vi.spyOn(window, "setTimeout");
      o.highlight("red");
      expect(o.isHighlighted).toBe(true);
      expect(o.highlightColor).toBe("red");
      expect(timers).not.toHaveBeenCalled();
    });

    it("expires the highlight", () => {
      o.highlight();
      o.highlightUntil = performance.now() - 1;
      expect(o.isHighlighted).toBe(false);
    });
  });
});
