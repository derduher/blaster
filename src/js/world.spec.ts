import World from "./World";
import Stage from "./Stage";
import Obj from "./Object";
import Point2 from "./Point2";
import Roid from "./Roid";
import { generateStage, generateObj } from "./spec-helper";

describe("World", () => {
  let world: World;
  let stage: Stage;
  beforeEach(() => {
    stage = generateStage();
    world = new World(stage);
  });

  describe("boundNTick", () => {
    it("prevents bound elements from going out of bounds", () => {
      const o = generateObj(stage);
      o.boundToCanvas = true;
      o.geo.v.x = -100;
      o.geo.v.y = -100;
      world.boundNTick(o, 1);
      expect(o.geo.v.x).toBe(0);
      expect(o.geo.v.y).toBe(0);
    });

    it("culls elements when they go out of bounds", () => {
      const o = generateObj(stage);
      o.geo.v.x = -100;
      o.geo.v.y = -100;
      vi.spyOn(stage.spatialManager, "registerObject");
      expect(world.boundNTick(o, 1)).toBe(true);
      expect(o.geo.v.x).toBe(-100);
      expect(o.geo.v.y).toBe(-100);
      expect(stage.spatialManager.registerObject).not.toHaveBeenCalled();
    });

    it("moves objects according to their velocity", () => {
      const o = generateObj(stage);
      o.geo.v.x = 100;
      o.geo.v.y = 100;
      expect(world.boundNTick(o, 1)).toBe(false);
      expect(o.geo.v.x).toBe(100);
      expect(o.geo.v.y).toBe(100);
    });

    it("does not cull a wide object that is still partially visible", () => {
      const wide = new Obj(new Point2(-101, 100), stage, [
        new Point2(0, 0),
        new Point2(180, 180),
      ]);
      wide.geo.v.x = -1;
      expect(world.boundNTick(wide, 1)).toBe(false);
    });

    it("culls an object once it is fully off screen", () => {
      const wide = new Obj(new Point2(-300, 100), stage, [
        new Point2(0, 0),
        new Point2(180, 180),
      ]);
      wide.geo.v.x = -1;
      expect(world.boundNTick(wide, 1)).toBe(true);
    });
  });

  describe("step", () => {
    it("generates roids", () => {
      vi.spyOn(Math, "random").mockReturnValue(1);
      vi.spyOn(world, "boundNTick").mockReturnValue(false);
      world.step(1);
      expect(stage.items[0] instanceof Roid).toBe(true);
    });

    it("spawns roids in native coordinate space, not device pixels", () => {
      vi.spyOn(Math, "random").mockReturnValue(1);
      vi.spyOn(world, "boundNTick").mockReturnValue(false);
      world.step(1);
      // mocked random of 1 puts the spawn at the full width of the space
      expect(stage.items[0].geo.pos.x).toBe(1920);
    });

    it("culls objects that are out of bounds", () => {
      stage.items.push(generateObj(stage));
      vi.spyOn(Math, "random").mockReturnValue(0);
      vi.spyOn(world, "boundNTick").mockReturnValue(true);
      world.step(1);
      expect(stage.items.length).toBe(0);
    });

    it("removes objects whose health is depleted", () => {
      const doomed = generateObj(stage);
      doomed.health = 0;
      stage.items.push(doomed);
      vi.spyOn(Math, "random").mockReturnValue(0);
      world.step(1);
      expect(stage.items).not.toContain(doomed);
    });

    it("keeps immortal objects even at zero health", () => {
      const eternal = generateObj(stage);
      eternal.immortal = true;
      eternal.health = -5;
      stage.items.push(eternal);
      vi.spyOn(Math, "random").mockReturnValue(0);
      world.step(1);
      expect(stage.items).toContain(eternal);
    });

    it("does not delete unrelated items when the same object dies twice over", () => {
      const victim = generateObj(stage);
      victim.health = 5;
      const bystander = generateObj(stage);
      bystander.geo.pos.x = 500;
      bystander.geo.pos.y = 500;
      stage.items.push(victim, bystander);
      vi.spyOn(Math, "random").mockReturnValue(0);
      vi.spyOn(world, "boundNTick").mockImplementation((i) => i === victim);
      world.step(1);
      expect(stage.items).toContain(bystander);
      expect(stage.items).not.toContain(victim);
    });

    it("checks for intersection", () => {
      const nearby = new Set<Obj>();
      nearby.add(generateObj(stage));
      nearby.add(generateObj(stage));
      stage.items.push(generateObj(stage));
      vi.spyOn(Math, "random").mockReturnValue(0);
      vi.spyOn(world, "boundNTick").mockReturnValue(false);
      vi.spyOn(world, "testIntersect");
      vi.spyOn(stage.spatialManager, "getNearby").mockReturnValue(nearby);
      world.step(1);
      expect(world.testIntersect).toHaveBeenCalled();
    });

    it("evaluates each colliding pair's geometry exactly once", () => {
      const points = (): Point2[] => [new Point2(0, 0), new Point2(10, 10)];
      const a = new Obj(new Point2(), stage, points());
      const b = new Obj(new Point2(), stage, points());
      stage.items.push(a, b);
      vi.spyOn(Math, "random").mockReturnValue(0);
      const aCheck = vi.spyOn(a.geo, "intersectsWith");
      const bCheck = vi.spyOn(b.geo, "intersectsWith");
      const aHit = vi.spyOn(a, "onHit");
      const bHit = vi.spyOn(b, "onHit");
      world.step(1);
      // narrow phase runs once per pair, not once per direction
      expect(aCheck.mock.calls.length + bCheck.mock.calls.length).toBe(1);
      // but both parties are still notified of the collision
      expect(aHit).toHaveBeenCalledTimes(1);
      expect(bHit).toHaveBeenCalledTimes(1);
    });
  });
});
