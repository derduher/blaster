import Point2 from "./Point2";
import Controls from "./Controls";
import Craft from "./Craft";
import Obj from "./Object";
import Projectile from "./Projectile";
import { generateStage } from "./spec-helper";

describe("Craft", () => {
  let controls: Controls;
  let craft: Craft;
  beforeEach(() => {
    controls = new Controls();
    craft = new Craft(generateStage(), controls, new Point2());
  });

  describe("tick", () => {
    it("moves left on pressing left control", () => {
      controls.left = true;
      craft.tick(1);
      expect(craft.geo.acc.x).toBeLessThan(0);
    });

    it("stops on pressing left and right control", () => {
      controls.left = true;
      controls.right = true;
      craft.tick(1);
      expect(craft.geo.acc.x).toBe(0);
    });

    it("reverses thrust when autobreak is on", () => {
      controls.autoBreak = true;
      craft.geo.v.x = 100;
      craft.tick(1);
      expect(craft.geo.acc.x).toBeLessThan(0);
    });

    it("kills acceleration when thrusters are no longer active", () => {
      controls.left = true;
      craft.tick(1);
      controls.left = false;
      craft.tick(1);
      expect(craft.geo.acc.x).toBe(0);
    });
  });

  describe("weapon switching", () => {
    it("advances one weapon per key press, not per tick", () => {
      controls.weaponNext = true;
      craft.tick(1);
      expect(craft.weaponIndex).toBe(1);
      // the key is still held; the action must have been consumed
      craft.tick(2);
      expect(craft.weaponIndex).toBe(1);
    });

    it("switches to the previous weapon and wraps below zero", () => {
      controls.weaponPrev = true;
      craft.tick(1);
      expect(craft.weaponIndex).toBe(3);
    });

    it("wraps forward past the last weapon", () => {
      for (const t of [1, 2, 3, 4]) {
        controls.weaponNext = true;
        craft.tick(t);
      }
      expect(craft.weaponIndex).toBe(0);
    });
  });

  describe("fire", () => {
    it("adds the new projectile to the spatialManager", () => {
      vi.spyOn(craft.stage.spatialManager, "registerObject");
      craft.fire(1);
      expect(craft.stage.spatialManager.registerObject).toHaveBeenCalled();
    });

    it("adds the new projectile the stage", () => {
      craft.fire(10);
      expect(craft.stage.items[0] instanceof Projectile).toBeTruthy();
    });

    it("only fires through tick when the rate of fire allows", () => {
      vi.spyOn(craft, "fire");
      controls.fire = true;
      craft.tick(100);
      craft.tick(101); // within the rate-of-fire window
      expect(craft.fire).toHaveBeenCalledTimes(1);
      craft.tick(400); // past the window
      expect(craft.fire).toHaveBeenCalledTimes(2);
    });

    it("never produces a zero-size (infinite velocity) projectile", () => {
      vi.spyOn(Math, "random").mockReturnValue(0);
      const c = new Craft(generateStage(), controls, new Point2());
      c.fire(1);
      const p = c.stage.items[0];
      expect(Number.isFinite(p.geo.v.y)).toBe(true);
      expect(p.geo.v.y).toBeLessThan(0);
    });

    it("spawns the projectile centered on the craft nose", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const c = new Craft(generateStage(), controls, new Point2(100, 200));
      c.fire(1);
      const p = c.stage.items[0];
      const size = 1 + ((0.5 * 19) | 0); // 10, from the mocked random
      // horizontal center of the hull (local x spans 10..58 -> 34)
      expect(p.geo.pos.x + size / 2).toBeCloseTo(100 + 34);
      // spawned fully above the hull's top edge (local y starts at 10)
      expect(p.geo.pos.y + size).toBeLessThanOrEqual(200 + 10);
    });

    it("inherits the craft's velocity", () => {
      craft.geo.v.x = 5;
      craft.geo.v.y = -2;
      craft.fire(1);
      const p = craft.stage.items[0];
      expect(p.geo.v.x).toBe(5);
      expect(p.geo.v.y).toBeLessThan(-2);
    });

    describe("bounce weapon", () => {
      // places the target directly below the projectile's center, along
      // its line of travel, so the reflection normal is unambiguous
      const targetBelow = (p: Projectile): Obj => {
        const center = p.geo.pos.x + (p.geo.aabb.min.x + p.geo.aabb.max.x) / 2;
        return new Obj(new Point2(center, p.geo.pos.y + 10000), craft.stage, [
          new Point2(),
        ]);
      };

      it("does not bounce on the default weapon", () => {
        craft.fire(1);
        const p = craft.stage.items[0] as Projectile;
        p.geo.v.y = 5;
        const preHealth = p.health;
        const target = targetBelow(p);
        const preTargetHealth = target.health;
        p.intersects(target);
        expect(p.health).toBe(preHealth - 10);
        expect(target.health).toBe(preTargetHealth - 10);
      });

      it("bounces projectiles fired from the last weapon slot", () => {
        for (const t of [1, 2, 3]) {
          controls.weaponNext = true;
          craft.tick(t);
        }
        expect(craft.weaponIndex).toBe(3);
        craft.fire(4);
        const p = craft.stage.items[0] as Projectile;
        p.geo.v.y = 5;
        const preHealth = p.health;
        const target = targetBelow(p);
        const preTargetHealth = target.health;
        p.intersects(target);
        expect(p.geo.v.y).toBeLessThan(0);
        expect(p.health).toBe(preHealth); // bouncing shots survive the hit
        expect(target.health).toBe(preTargetHealth - 10);
      });
    });
  });
});
