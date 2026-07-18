import Geo from "./Geo";
import { defaultObjMass } from "./config";
import Stage from "./Stage";
import Point2 from "./Point2";
import Vector2 from "./Vector2";

export default class Obj {
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

  // called once per collision per party; Game removes anything whose
  // health is depleted after the collision pass
  public intersects(o: Obj): void {
    this.health -= 10;
    this.highlight();
    o.highlight();
  }
}
