import Geo from "./Geo";
import { defaultObjMass } from "./config";
import Stage from "./Stage";
import Point2 from "./Point2";
import Vector2 from "./Vector2";
import { Collidable, HitContext } from "./Collision";

export default class Obj implements Collidable {
  private static nextId = 0;
  public readonly id: number = Obj.nextId++;
  public mass: number;
  public geo: Geo;
  public path: Path2D;

  public dead = false;
  public boundToCanvas = false;
  public highlightUntil = 0;
  public highlightColor = "";
  public immortal = false;
  public health = 1;

  public get isHighlighted(): boolean {
    return window.performance.now() < this.highlightUntil;
  }

  // the collision reference point: the AABB midpoint in world space. Collision
  // resolution builds the center-to-center normal from this, so it is the only
  // geometry an entity exposes across the collision seam.
  public get center(): Point2 {
    return new Point2(
      this.geo.pos.x + (this.geo.aabb.min.x + this.geo.aabb.max.x) / 2,
      this.geo.pos.y + (this.geo.aabb.min.y + this.geo.aabb.max.y) / 2,
    );
  }

  public constructor(
    pos: Point2,
    public stage: Stage,
    points: Point2[],
    v?: Vector2,
  ) {
    this.mass = defaultObjMass;
    this.geo = new Geo(points, pos, v);

    this.path = new Path2D();
  }

  /* istanbul ignore next */
  public draw(ctx: CanvasRenderingContext2D, debug = false): void {
    ctx.strokeStyle = "rgb(255,255,255)";
    if (this.isHighlighted) {
      ctx.strokeStyle = this.highlightColor;
    }
    ctx.translate(this.geo.pos.x, this.geo.pos.y);
    ctx.stroke(this.path);
    if (debug) {
      ctx.font = "24px roboto";
      ctx.fillText(this.health + "", 10, 35);
    }
  }

  // a timestamp comparison instead of a setTimeout per collision: under
  // sustained collisions the timers used to pile up by the hundreds
  public highlight(highlightColor = "yellow"): void {
    this.highlightColor = highlightColor;
    this.highlightUntil = window.performance.now() + 5000;
  }

  /* istanbul ignore next */

  public tick(now: number): void {}

  // invoked once per collision per party by resolveCollision; World removes
  // anything whose health is depleted after the collision pass. The base rule:
  // take damage and flash both parties. The provided normal is unused here —
  // only ricocheting entities consume it.
  public onHit(ctx: HitContext): void {
    this.health -= 10;
    this.highlight();
    ctx.other.highlight();
  }
}
