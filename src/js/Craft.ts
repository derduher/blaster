import Point2 from "./Point2";
import Obj from "./Object";
import Projectile from "./Projectile";
import Stage from "./Stage";
import Controls from "./Controls";
import Vector2 from "./Vector2";
import { pathFromPoints, pathFromSegments } from "./draw";
import { craft } from "./config";
const {
  rateOfFire,
  speed,
  force,
  barrelLength,
  mass,
  health,
  immortal,
  geo,
  thruster
} = craft;

const leftThrusterPath = pathFromPoints(thruster.left);
const rightThrusterPath = pathFromPoints(thruster.right);
const upThrusterPath = pathFromPoints(thruster.up);
const downThrusterPath = pathFromPoints(thruster.down);

const posDir = speed;
const negDir = speed * -1;

export default class Craft extends Obj {
  private weaponConfigurations: number[];
  public ctrl: Controls;
  private originalPath: Path2D;
  private lastFire = 0;
  public boundToCanvas = true;
  public immortal = immortal;
  public health = health;
  public mass = mass; // Gg
  private currentWeapon = 0;
  public constructor(stage: Stage, ctrl: Controls, pos: Point2) {
    super(pos, stage, geo.flat());
    this.weaponConfigurations = [
      (Math.random() * 20) | 0,
      (Math.random() * 20) | 0,
      (Math.random() * 20) | 0,
      (Math.random() * 20) | 0
    ];

    this.originalPath = this.path = pathFromSegments(geo);

    this.ctrl = ctrl;
  }

  public tick(now: number): void {
    const lastFireDelta = now - this.lastFire;

    // set ctrl dir
    if (this.ctrl.left && !this.ctrl.right) {
      this.geo.acc.x = negDir;
    } else if (this.ctrl.right && !this.ctrl.left) {
      this.geo.acc.x = posDir;
    } else if (
      this.ctrl.autoBreak &&
      (this.geo.v.x > speed || this.geo.v.x < -speed)
    ) {
      if (this.geo.v.x > speed) {
        this.geo.acc.x = negDir;
      } else if (this.geo.v.x < -speed) {
        this.geo.acc.x = posDir;
      }
    } else {
      this.geo.acc.x = 0;
    }

    // set ctrl dir
    if (this.ctrl.down && !this.ctrl.up) {
      this.geo.acc.y = posDir;
    } else if (this.ctrl.up && !this.ctrl.down) {
      this.geo.acc.y = negDir;
    } else if (
      this.ctrl.autoBreak &&
      (this.geo.v.y > speed || this.geo.v.y < -speed)
    ) {
      if (this.geo.v.y > speed) {
        this.geo.acc.y = negDir;
      } else if (this.geo.v.y < -speed) {
        this.geo.acc.y = posDir;
      }
    } else {
      this.geo.acc.y = 0;
    }

    if (this.ctrl.touch) {
      this.geo.pos.x = this.ctrl.touchX;
      this.geo.pos.y = this.ctrl.touchY;
    }

    if (this.ctrl.fire && lastFireDelta > rateOfFire) {
      this.fire(now);
    }

    if (this.ctrl.weaponNext) {
      this.nextConfiguration();
    }

    if (this.ctrl.weaponPrev) {
      this.nextConfiguration();
    }

    if (this.geo.acc.x !== 0 || this.geo.acc.y !== 0) {
      this.path = new Path2D(this.originalPath);
      if (this.geo.acc.x > 0) {
        this.path.addPath(leftThrusterPath);
      } else if (this.geo.acc.x < 0) {
        this.path.addPath(rightThrusterPath);
      }

      if (this.geo.acc.y > 0) {
        this.path.addPath(upThrusterPath);
      } else if (this.geo.acc.y < 0) {
        this.path.addPath(downThrusterPath);
      }
    } else {
      this.path = this.originalPath;
    }
  }

  public nextConfiguration(): void {
    this.currentWeapon =
      (this.currentWeapon + 1) % this.weaponConfigurations.length;
  }

  public prevConfiguration(): void {
    this.currentWeapon = Math.abs(
      this.currentWeapon - (1 % this.weaponConfigurations.length)
    );
  }

  public fire(now: number): void {
    const size = this.weaponConfigurations[this.currentWeapon];
    const pos = new Point2(
      this.geo.pos.x + this.geo.aabb.max.x / 2 + this.geo.v.x + 10 - size / 2,
      this.geo.pos.y - size + 5
    );

    const velY = Math.sqrt((2 * barrelLength * force) / size);
    const p = new Projectile(pos, new Vector2(0, -velY), this.stage, size);

    this.stage.items.push(p);
    this.stage.spatialManager.registerObject(p, p.geo);
    this.lastFire = now;
  }
}
