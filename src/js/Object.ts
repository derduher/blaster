import Geo from "./Geo";
import { defaultObjMass } from "./config";
import Stage from "./Stage";
import Point2 from "./Point2";
import Vector2 from "./Vector2";

export default class Obj {
  public mass: number;
  public geo: Geo;
  public path: Path2D;

  public boundToCanvas = false;
  public isHighlighted = false;
  public isDisplayCell = false;
  public highlightColor = "";
  public immortal = false;
  public health = 1;
  public constructor(
    pos: Point2,
    public stage: Stage,
    points: Point2[],
    v?: Vector2
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
    // if (this.isDisplayCell) {
    // ctx.font = '24px roboto'
    // ctx.fillText(window.spatial.getIdForObject(this.geo).join(', '), 10, 0)
    // }
  }

  /* istanbul ignore next */
  public displayCell(): void {
    this.isDisplayCell = true;
  }

  /* istanbul ignore next */
  public highlight(highlightColor = "yellow"): void {
    this.isHighlighted = true;
    this.highlightColor = highlightColor;
    window.setTimeout((): boolean => (this.isHighlighted = false), 5000);
  }

  /* istanbul ignore next */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public tick(now: number): void {}

  public intersects(o: Obj, i: number, cullQ: number[]): void {
    // f = ma
    // let fx = (this.geo.v.x / 16.7) * this.mass
    // let fy = (this.geo.v.y / 16.7) * this.mass
    this.health -= 10;
    if (this.health <= 0 && this.immortal !== true) {
      cullQ.push(i);
    }
    this.highlight();
    o.highlight();
  }
}
