import Stage from "./Stage";
import Projectile from "./Projectile";
import Point2 from "./Point2";
import Obj from "./Object";
import Vector2 from "./Vector2";
import { generateStage, generateObj } from "./spec-helper";

describe("Projectile", () => {
  let projectile: Projectile;
  let stage: Stage;
  beforeEach(() => {
    stage = generateStage();
    projectile = new Projectile(new Point2(), new Vector2(), stage);
  });

  it("decrements its own health when it hits without bouncing", () => {
    const o = generateObj(stage);
    const preProjectileHealth = projectile.health;
    projectile.onHit({ other: o, normal: new Vector2() });
    expect(preProjectileHealth - 10).toBe(projectile.health);
  });

  it("damages the object it hits", () => {
    const o = generateObj(stage);
    const preTargetHealth = o.health;
    projectile.onHit({ other: o, normal: new Vector2() });
    expect(preTargetHealth - 10).toBe(o.health);
  });

  describe("bouncing projectiles", () => {
    const square = (size: number): Point2[] => [
      new Point2(0, 0),
      new Point2(size, 0),
      new Point2(size, size),
      new Point2(0, size),
    ];

    // a 20x20 target whose world center is (10, 30)
    const makeTarget = (): Obj => new Obj(new Point2(0, 20), stage, square(20));

    // the center-to-center normal resolveCollision would hand the projectile
    const normalTo = (p: Projectile, target: Obj): Vector2 =>
      new Vector2(p.center.x - target.center.x, p.center.y - target.center.y);

    it("reflects off the target instead of dying", () => {
      const target = makeTarget();
      // 4px projectile centered at (10, 2), heading straight down
      const p = new Projectile(new Point2(8, 0), new Vector2(0, 5), stage, 4, {
        bounce: true,
      });
      const preHealth = p.health;
      p.onHit({ other: target, normal: normalTo(p, target) });
      expect(p.geo.v.y).toBeLessThan(0);
      expect(p.health).toBe(preHealth);
    });

    it("still damages the target when bouncing", () => {
      const target = makeTarget();
      const p = new Projectile(new Point2(8, 0), new Vector2(0, 5), stage, 4, {
        bounce: true,
      });
      const preTargetHealth = target.health;
      p.onHit({ other: target, normal: normalTo(p, target) });
      expect(target.health).toBe(preTargetHealth - 10);
    });

    it("does not re-reflect while already moving away", () => {
      const target = makeTarget();
      const p = new Projectile(new Point2(8, 0), new Vector2(0, -5), stage, 4, {
        bounce: true,
      });
      p.onHit({ other: target, normal: normalTo(p, target) });
      expect(p.geo.v.y).toBe(-5);
    });

    it("defaults to the non-bouncing behavior", () => {
      const target = makeTarget();
      const p = new Projectile(new Point2(8, 0), new Vector2(0, 5), stage, 4);
      const preHealth = p.health;
      p.onHit({ other: target, normal: normalTo(p, target) });
      expect(p.health).toBe(preHealth - 10);
      expect(p.geo.v.y).toBe(5);
    });
  });
});
