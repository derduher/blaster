import Stage from "./Stage";
import Obj from "./Object";
import Roid from "./Roid";
import roidPosFactory from "./roidPosFactory";
import { resolveCollision } from "./Collision";
import { nativeWidth, nativeHeight } from "./config";

/**
 * The simulation: spawning, movement/bounds, collision, and removal of
 * dead entities. Operates on the Stage once per fixed tick via step().
 */
export default class World {
  public constructor(public stage: Stage) {}

  public step(tickTime: number): void {
    if (Math.random() > 0.99) {
      this.stage.items.push(
        new Roid(roidPosFactory(nativeWidth, nativeHeight), this.stage),
      );
    }

    this.stage.spatialManager.clearMap();
    for (const item of this.stage.items) {
      if (this.boundNTick(item, tickTime)) {
        item.dead = true;
      }
    }

    /**
     * for every item on stage, look for items nearby and test whether they intersect
     */
    for (const item of this.stage.items) {
      for (const o of this.stage.spatialManager.getNearby(item.geo)) {
        this.testIntersect(item, o);
      }
    }

    this.stage.items = this.stage.items.filter(
      (o): boolean => !o.dead && (o.health > 0 || o.immortal),
    );
  }

  // I don't remember what the intended order of ops is on this
  public boundNTick(i: Obj, tickTime: number): boolean {
    i.tick(tickTime);
    const x = i.geo.pos.x + i.geo.v.x;
    const y = i.geo.pos.y + i.geo.v.y;
    i.geo.v.x += i.geo.acc.x;
    i.geo.v.y += i.geo.acc.y;
    let cull = false;

    // unbound objects are culled only once their full extent is off screen
    if (
      ((i.geo.v.x <= 0 || x < this.stage.xmax - i.geo.aabb.max.x) &&
        (i.geo.v.x >= 0 || x > this.stage.xmin)) ||
      (!i.boundToCanvas &&
        x < this.stage.xmax &&
        x > this.stage.xmin - i.geo.aabb.max.x)
    ) {
      i.geo.pos.x = x;
    } else if (!i.boundToCanvas) {
      cull = true;
    } else {
      i.geo.v.x = 0;
    }

    if (
      ((i.geo.v.y <= 0 || y < this.stage.ymax - i.geo.aabb.max.y) &&
        (i.geo.v.y >= 0 || y > this.stage.ymin)) ||
      (!i.boundToCanvas &&
        y < this.stage.ymax &&
        y > this.stage.ymin - i.geo.aabb.max.y)
    ) {
      i.geo.pos.y = y;
    } else if (!i.boundToCanvas) {
      cull = true;
    } else {
      i.geo.v.y = 0;
    }

    if (!cull) {
      this.stage.spatialManager.registerObject(i, i.geo);
    }
    return cull;
  }

  // processes the pair only when item.id < o.id so each collision is
  // evaluated once, then hands the confirmed pair to collision resolution
  public testIntersect(item: Obj, o: Obj): void {
    if (item.id < o.id && item.geo.intersectsWith(o.geo)) {
      resolveCollision(item, o);
    }
  }
}
