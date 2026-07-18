import Vector2 from "./Vector2";
import Point2 from "./Point2";
import { BoundingBox } from "./types";
import Obj from "./Object";
import { GenPos } from "./roidPosFactory";

export default class Geo implements GenPos {
  public aabb: BoundingBox;
  public treatAsPoint = false;
  private _rotation = 0;
  // reused by worldPoints() so collision tests allocate nothing per call
  private scratch: Point2[] = [];
  public constructor(
    public points: Point2[],
    public pos = new Point2(),
    public v = new Vector2(),
    public acc = new Vector2(),
  ) {
    this.aabb = Geo.getBBForPoints(points);
  }

  public get rotation(): number {
    return this._rotation;
  }

  public set rotation(radians: number) {
    this._rotation = radians;
    this.refreshAABB();
  }

  // model-space centroid; rotation pivots around it
  private centroid(): Point2 {
    let x = 0;
    let y = 0;
    for (const p of this.points) {
      x += p.x;
      y += p.y;
    }
    return new Point2(x / this.points.length, y / this.points.length);
  }

  // recompute the AABB from the current points and rotation; call after
  // mutating points or rotation
  public refreshAABB(): void {
    if (this._rotation === 0) {
      this.aabb = Geo.getBBForPoints(this.points);
      return;
    }
    this.aabb = Geo.getBBForPoints(this.localPoints([]));
  }

  // points rotated in model space (no position applied), written into out
  private localPoints(out: Point2[]): Point2[] {
    const cos = Math.cos(this._rotation);
    const sin = Math.sin(this._rotation);
    const c = this.centroid();
    for (let i = 0; i < this.points.length; i++) {
      const dx = this.points[i].x - c.x;
      const dy = this.points[i].y - c.y;
      const x = c.x + dx * cos - dy * sin;
      const y = c.y + dx * sin + dy * cos;
      if (out[i]) {
        out[i].x = x;
        out[i].y = y;
      } else {
        out[i] = new Point2(x, y);
      }
    }
    out.length = this.points.length;
    return out;
  }

  // the polygon in world space: rotated around the centroid, then
  // translated by pos; reuses a scratch buffer, so the result is only
  // valid until the next call on this Geo
  public worldPoints(): Point2[] {
    if (this._rotation === 0) {
      const n = this.points.length;
      for (let i = 0; i < n; i++) {
        if (this.scratch[i]) {
          this.scratch[i].x = this.points[i].x + this.pos.x;
          this.scratch[i].y = this.points[i].y + this.pos.y;
        } else {
          this.scratch[i] = new Point2(
            this.points[i].x + this.pos.x,
            this.points[i].y + this.pos.y,
          );
        }
      }
      this.scratch.length = n;
      return this.scratch;
    }
    this.localPoints(this.scratch);
    for (const p of this.scratch) {
      p.x += this.pos.x;
      p.y += this.pos.y;
    }
    return this.scratch;
  }

  public static getBBForPoints(points: Point2[]): BoundingBox {
    const iv: BoundingBox = {
      min: new Point2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
      max: new Point2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
    };
    return points.reduce((aabb: BoundingBox, point: Point2): BoundingBox => {
      if (point.x < aabb.min.x) {
        aabb.min.x = point.x;
      }

      if (point.y < aabb.min.y) {
        aabb.min.y = point.y;
      }

      if (point.x > aabb.max.x) {
        aabb.max.x = point.x;
      }

      if (point.y > aabb.max.y) {
        aabb.max.y = point.y;
      }

      return aabb;
    }, iv);
  }

  // A^2 + B^2 = C^2
  public distanceTo(pos: Point2): number {
    return Math.sqrt(
      Math.pow(pos.x - this.pos.x, 2) + Math.pow(pos.y - this.pos.y, 2),
    );
  }

  public distanceToObj(obj: Obj): number {
    return this.distanceTo(obj.geo.pos);
  }

  // This can probably be simplified.
  public aabbIntersects(b: Geo): boolean {
    let left; // the object that is the most to the left
    let right;
    let top;
    let bottom;
    if (this.pos.x + this.aabb.min.x < b.pos.x + b.aabb.min.x) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      left = this;
      right = b;
    } else {
      left = b;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      right = this;
    }

    if (this.pos.y + this.aabb.min.y < b.pos.y + b.aabb.min.y) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      top = this;
      bottom = b;
    } else {
      top = b;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      bottom = this;
    }

    return (
      right.pos.x + right.aabb.min.x < left.pos.x + left.aabb.max.x &&
      bottom.pos.y + bottom.aabb.min.y < top.pos.y + top.aabb.max.y
    );
  }

  // http://martin-thoma.com/how-to-check-if-two-line-segments-intersect/
  public static crossProduct(a: Vector2 | Point2, b: Vector2 | Point2): number {
    return a.x * b.y - b.x * a.y;
  }

  public static isPointOnLine(aa: Point2, ab: Point2, b: Point2): boolean {
    const aTmp: Point2 = new Point2(ab.x - aa.x, ab.y - aa.y);
    const bTmp: Point2 = new Point2(b.x - aa.x, b.y - aa.y);
    return Math.abs(Geo.crossProduct(aTmp, bTmp)) < Number.EPSILON;
  }

  public static isPointRightOfLine(aa: Point2, ab: Point2, b: Point2): boolean {
    // Move the image, so that a.first is on (0|0)
    const aTmp: Point2 = new Point2(ab.x - aa.x, ab.y - aa.y);
    const bTmp: Point2 = new Point2(b.x - aa.x, b.y - aa.y);
    return Geo.crossProduct(aTmp, bTmp) < 0;
  }

  public static segmentTouchesOrCrosses(
    aa: Point2,
    ab: Point2,
    ba: Point2,
    bb: Point2,
  ): boolean {
    return (
      Geo.isPointOnLine(aa, ab, ba) ||
      Geo.isPointOnLine(aa, ab, bb) ||
      Geo.isPointRightOfLine(aa, ab, ba) !== Geo.isPointRightOfLine(aa, ab, bb)
    );
  }

  public static getSegmentBB(a: Point2, b: Point2): Point2[] {
    return [
      new Point2(Math.min(a.x, b.x), Math.min(a.y, b.y)),
      new Point2(Math.max(a.x, b.x), Math.max(a.y, b.y)),
    ];
  }

  public static segmentsBBIntersect(
    aa: Point2,
    ab: Point2,
    ba: Point2,
    bb: Point2,
  ): boolean {
    const firstbb = Geo.getSegmentBB(aa, ab);
    const secondbb = Geo.getSegmentBB(ba, bb);
    return (
      firstbb[0].x <= secondbb[1].x &&
      firstbb[1].x >= secondbb[0].x &&
      firstbb[0].y <= secondbb[1].y &&
      firstbb[1].y >= secondbb[0].y
    );
  }

  public static segmentsIntersect(
    aa: Point2,
    ab: Point2,
    ba: Point2,
    bb: Point2,
  ): boolean {
    return (
      Geo.segmentsBBIntersect(aa, ab, ba, bb) &&
      Geo.segmentTouchesOrCrosses(aa, ab, ba, bb) &&
      Geo.segmentTouchesOrCrosses(ba, bb, aa, ab)
    );
  }

  public intersectsWith(ogeo: Geo): boolean {
    let collision = false;

    if (!this.aabbIntersects(ogeo)) {
      return false;
    } else if (this.treatAsPoint || ogeo.treatAsPoint) {
      const pointGeo = this.treatAsPoint ? this : ogeo;
      const polyGeo = this.treatAsPoint ? ogeo : this;
      const points = polyGeo.worldPoints();
      const point = new Point2(
        pointGeo.pos.x + (pointGeo.aabb.min.x + pointGeo.aabb.max.x) / 2,
        pointGeo.pos.y + (pointGeo.aabb.min.y + pointGeo.aabb.max.y) / 2,
      );
      // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
      for (let i = 0, prev = points.length - 1; i < points.length; prev = i++) {
        if (
          points[i].y > point.y !== points[prev].y > point.y &&
          point.x <
            ((points[prev].x - points[i].x) * (point.y - points[i].y)) /
              (points[prev].y - points[i].y) +
              points[i].x
        ) {
          collision = !collision;
        }
      }
    } else {
      const points = this.worldPoints();
      const opoints = ogeo.worldPoints();
      for (let i = 0, prev = points.length - 1; i < points.length; prev = i++) {
        for (
          let oi = 0, oprev = opoints.length - 1;
          oi < opoints.length;
          oprev = oi++
        ) {
          if (
            Geo.segmentsIntersect(
              points[i],
              points[prev],
              opoints[oi],
              opoints[oprev],
            )
          ) {
            collision = true;
            break;
          }
        }
        if (collision) {
          break;
        }
      }
    }
    return collision;
  }
}
