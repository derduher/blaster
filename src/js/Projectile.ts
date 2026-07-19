import Obj from "./Object";
import { projectile } from "./config";
import Stage from "./Stage";
import Point2 from "./Point2";
import Vector2 from "./Vector2";
import { HitContext } from "./Collision";
const { mass, width: defaultWidth, health } = projectile;

export default class Projectile extends Obj {
  public boundToCanvas = false;
  private diameter: number;
  private bounce: boolean;
  public mass = mass; // Gg
  public health = health;
  public constructor(
    pos: Point2,
    v: Vector2,
    stage: Stage,
    diameter = defaultWidth,
    opts: { bounce?: boolean } = {},
  ) {
    // the projectile is drawn as a circle; its bounding square is enough
    // geometry for collision, since it is treated as its center point
    super(
      pos,
      stage,
      [
        new Point2(0, 0),
        new Point2(diameter, 0),
        new Point2(diameter, diameter),
        new Point2(0, diameter),
      ],
      v,
    );
    this.diameter = diameter;
    this.bounce = opts.bounce ?? projectile.bounce;
    this.geo.treatAsPoint = true;
  }

  /* istanbul ignore next */
  public draw(ctx: CanvasRenderingContext2D /*, debug = false */): void {
    ctx.translate(this.geo.pos.x, this.geo.pos.y);
    // bouncing shots get a distinct color so players can tell them apart
    ctx.fillStyle = this.bounce ? "rgb(80,200,255)" : "rgb(255,255,255)";
    if (this.isHighlighted) {
      ctx.fillStyle = this.highlightColor;
    }
    ctx.beginPath();
    ctx.arc(
      this.diameter / 2,
      this.diameter / 2,
      this.diameter / 2,
      0,
      2 * Math.PI,
    );
    ctx.fill();
    ctx.stroke();
  }

  public onHit(ctx: HitContext): void {
    ctx.other.health -= 10;
    if (this.bounce) {
      this.reflectOff(ctx.normal);
      this.highlight();
      ctx.other.highlight();
      return;
    }
    super.onHit(ctx);
  }

  // elastic ricochet: reflect velocity across the collision normal handed in
  // by resolveCollision (the raw center-to-center vector), but only while
  // approaching, so an overlapping projectile doesn't flip back and forth on
  // consecutive ticks
  private reflectOff(normal: Vector2): void {
    const nx = normal.x;
    const ny = normal.y;
    const len = Math.sqrt(nx * nx + ny * ny);
    if (len === 0) {
      // dead-center overlap has no meaningful normal; just turn around
      this.geo.v.x *= -1;
      this.geo.v.y *= -1;
      return;
    }
    const dot = (this.geo.v.x * nx + this.geo.v.y * ny) / len;
    if (dot >= 0) {
      return;
    }
    this.geo.v.x -= (2 * dot * nx) / len;
    this.geo.v.y -= (2 * dot * ny) / len;
  }
}
