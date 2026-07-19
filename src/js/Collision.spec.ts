import Point2 from "./Point2";
import Vector2 from "./Vector2";
import Obj from "./Object";
import Projectile from "./Projectile";
import { resolveCollision, Collidable, HitContext } from "./Collision";
import { generateStage } from "./spec-helper";

// a minimal Collidable that records the contexts it is handed, so the resolver
// can be exercised without building real entities
function fake(cx: number, cy: number): Collidable & { calls: HitContext[] } {
  return {
    center: new Point2(cx, cy),
    health: 100,
    highlight(): void {},
    calls: [] as HitContext[],
    onHit(ctx: HitContext): void {
      this.calls.push(ctx);
    },
  };
}

describe("resolveCollision", () => {
  it("notifies each party once, referencing the other", () => {
    const a = fake(10, 0);
    const b = fake(0, 0);
    resolveCollision(a, b);
    expect(a.calls.length).toBe(1);
    expect(b.calls.length).toBe(1);
    expect(a.calls[0].other).toBe(b);
    expect(b.calls[0].other).toBe(a);
  });

  it("hands each party the center-to-center normal, negated for the far side", () => {
    const a = fake(10, 5);
    const b = fake(4, 1);
    resolveCollision(a, b);
    // a points away from b; b points away from a
    expect(a.calls[0].normal).toEqual(new Vector2(6, 4));
    expect(b.calls[0].normal).toEqual(new Vector2(-6, -4));
  });

  // characterization: locks the current (asymmetric) damage totals so the move
  // to a resolver stays a pure refactor. Rebalancing is a separate decision.
  describe("current damage totals", () => {
    const square: Point2[] = [
      new Point2(0, 0),
      new Point2(10, 0),
      new Point2(10, 10),
      new Point2(0, 10),
    ];

    it("takes 20 off a struck target and 10 off a non-bouncing projectile", () => {
      const stage = generateStage();
      const target = new Obj(new Point2(0, 0), stage, square);
      const p = new Projectile(new Point2(0, 0), new Vector2(), stage);
      const targetHealth = target.health;
      const projectileHealth = p.health;
      resolveCollision(p, target);
      expect(target.health).toBe(targetHealth - 20);
      expect(p.health).toBe(projectileHealth - 10);
    });

    it("is independent of the argument order", () => {
      const stage = generateStage();
      const target = new Obj(new Point2(0, 0), stage, square);
      const p = new Projectile(new Point2(0, 0), new Vector2(), stage);
      const targetHealth = target.health;
      const projectileHealth = p.health;
      resolveCollision(target, p);
      expect(target.health).toBe(targetHealth - 20);
      expect(p.health).toBe(projectileHealth - 10);
    });

    it("spares a bouncing projectile while still taking 20 off the target", () => {
      const stage = generateStage();
      const target = new Obj(new Point2(0, 20), stage, square);
      const p = new Projectile(new Point2(3, 0), new Vector2(0, 5), stage, 4, {
        bounce: true,
      });
      const targetHealth = target.health;
      const projectileHealth = p.health;
      resolveCollision(p, target);
      expect(target.health).toBe(targetHealth - 20);
      expect(p.health).toBe(projectileHealth);
      expect(p.geo.v.y).toBeLessThan(0);
    });

    it("damages each of two plain entities by 10", () => {
      const stage = generateStage();
      const a = new Obj(new Point2(0, 0), stage, square);
      const b = new Obj(new Point2(5, 5), stage, square);
      resolveCollision(a, b);
      expect(a.health).toBe(-9);
      expect(b.health).toBe(-9);
    });
  });
});
