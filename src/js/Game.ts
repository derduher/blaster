import Stage from "./Stage";
import SpatialManager from "spatial-hashmap";
import Roid from "./Roid";
import Craft from "./Craft";
// import NPC from './NPC.js'
import Point2 from "./Point2";
import Obj from "./Object";
import Controls from "./Controls";
import roidPosFactory from "./roidPosFactory";
import {
  fpsFilter,
  cellSize,
  nativeWidth,
  nativeHeight,
  tickLength,
  craft
} from "./config";

interface Debug {
  on: boolean;
  fps: number;
  text: string;
  numUpdates: number;
  itemL: number;
  drawRate: number;
  lastRender: number;
}

const debug: Debug = {
  on: false,
  fps: 50,
  text: "",
  numUpdates: 0,
  itemL: 0,
  drawRate: 250,
  lastRender: Number.POSITIVE_INFINITY
};

export default class Game {
  public updateIsReady: boolean;
  public hitboxes: Set<Point2>;
  public lastRender: number;
  public ctrl: Controls;
  public started: boolean;
  public stage: Stage;
  public ctx: CanvasRenderingContext2D | null;
  public count: number;
  public lastTick: number;
  public isTouchInterface: boolean;
  public craft: Craft;
  public tickLength: number;
  public stopMain: number;
  public debug: Debug;
  public hatches: Path2D;
  public constructor(canvas: HTMLCanvasElement) {
    this.hatches = new Path2D();
    this.stopMain = 0;
    this.updateIsReady = false;
    this.hitboxes = new Set();
    this.debug = debug;
    this.lastRender = window.performance.now();
    this.tickLength = tickLength;
    this.ctrl = new Controls();
    this.lastTick = this.lastRender;
    this.debug.lastRender = this.lastRender;

    const spatialManager = new SpatialManager<Obj>(
      nativeWidth,
      nativeHeight,
      cellSize
    );
    this.stage = new Stage(canvas, spatialManager);
    this.started = false;

    this.isTouchInterface = "ontouchend" in document.documentElement;

    this.stage.canvas.onclick = (): void => {
      if (this.isTouchInterface || this.started) {
        this.stage.canvas.requestFullscreen();
      }
      if (!this.started) {
        this.resume();
      }
    };
    document.addEventListener("keyup", this.pausedOnKeyUp.bind(this));
    document.addEventListener("keyup", this.ctrl.ku.bind(this.ctrl));
    document.onkeydown = this.ctrl.kd.bind(this.ctrl);
    window.onresize = (): void => this.updateCanvasBoundaries();

    this.craft = new Craft(
      this.stage,
      this.ctrl,
      new Point2(
        document.documentElement.clientWidth / 2 - craft.width / 2,
        document.documentElement.clientHeight - craft.width - this.stage.padding
      )
    );
    this.stage.spatialManager.registerObject(this.craft, this.craft.geo);
    this.stage.items.push(this.craft);
    this.stage.craft = this.craft;

    this.ctx = this.stage.canvas.getContext("2d");
    this.updateCanvasBoundaries();
    if (this.ctx) {
      this.ctx.fillStyle = "rgb(255,255,255)";
      this.ctx.strokeStyle = "rgb(255,255,255)";
      this.ctx.save();
      this.ctx.save();
    }
    this.showInstructions();
    this.count = 0;

    // this.npc = new NPC(new Point2(document.documentElement.clientWidth / 2, document.documentElement.clientHeight / 4), this.stage)
    // this.stage.spatialManager.registerObject(this.npc)
    // this.stage.items.push(this.npc)

    // let roid = new Roid(roidPosFactory(this.stage.canvas.width, this.stage.canvas.height), this.stage)
    // window.roid = roid
    // this.stage.items.push(roid)
    // this.stage.spatialManager.registerObject(roid)

    // let p = new Projectile({geo: {
    // pos: {x: (this.stage.canvas.width / 2) + roid.width / 2, y: (this.stage.canvas.height / 2) + roid.width / 2},
    // v: {x: 0, y: 0}
    // },
    // width: 20
    // }, {x: 0, y: 0})
    // window.p = p
    // this.stage.items.push(p)
    // this.stage.spatialManager.registerObject(p)
  }

  public updateReady(): void {
    this.updateIsReady = true;
  }

  public main(tFrame: number): void {
    this.started = true;
    let timeSinceTick;
    const nextTick = this.lastTick + this.tickLength;
    let numTicks = 0;
    let ud = false;
    let thisFrameFPS = 60.1;

    this.stopMain = window.requestAnimationFrame(this.main.bind(this));

    if (this.debug.on) {
      ud = tFrame - this.debug.lastRender > this.debug.drawRate;

      if (ud) {
        thisFrameFPS = 1000 / (tFrame - this.lastRender);
        this.debug.fps += (thisFrameFPS - this.debug.fps) / fpsFilter;
        this.debug.lastRender = tFrame;
        this.debug.itemL = this.stage.items.length;
      }
    }

    if (this.ctrl.toggleFS) {
      this.pause();
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        this.stage.canvas.requestFullscreen();
      }
    }

    // If tFrame < nextTick then 0 ticks need to be updated (0 is default for numTicks).
    // If tFrame = nextTick then 1 tick needs to be updated (and so forth).
    // Note: As we mention in summary, you should keep track of how large numTicks is.
    // If it is large, then either your game was asleep, or the machine cannot keep up.
    if (tFrame > nextTick) {
      timeSinceTick = tFrame - this.lastTick;
      numTicks = (timeSinceTick / this.tickLength) | 0;
      if (numTicks > 4) {
        numTicks = 4;
      }
    }

    this.updates(numTicks);

    if (this.debug.on && ud) {
      this.debug.numUpdates = numTicks;
    }

    this.draw();
    this.lastRender = tFrame;
  }

  public updateCanvasBoundaries(): void {
    if (document.fullscreenElement) {
      this.stage.canvas.width = window.screen.width;
      this.stage.canvas.height = window.screen.height;
    } else {
      this.stage.canvas.width = window.innerWidth;
      this.stage.canvas.height = window.innerHeight;
    }

    this.stage.canvas.style.width = this.stage.canvas.width + "px";
    this.stage.canvas.style.height = this.stage.canvas.height + "px";

    this.stage.xmax = nativeWidth - this.stage.padding;
    this.stage.xmin = this.stage.padding;
    this.stage.ymin = this.stage.padding;
    this.stage.ymax = nativeHeight - this.stage.padding;

    this.hatches = new Path2D();
    const w = cellSize;
    let max = this.stage.canvas.width / w;
    if (this.stage.canvas.height / w > max) {
      max = this.stage.canvas.height / w;
    }
    // this.debug.text++
    // this.stage.items = []
    // for (var i=0; i<8; i++) {
    // for (var j=0;j < 5; j++) {
    // this.stage.items.push(new Roid(this.stage.canvas.width, i*90, j*90))
    // }
    // }
    this.stage.spatialManager = new SpatialManager(
      nativeWidth,
      nativeHeight,
      cellSize
    );

    this.stage.items.forEach((i): void =>
      this.stage.spatialManager.registerObject(i, i.geo)
    );
    if (this.started && !this.stopMain) {
      this.draw();
      this.showPause();
    }
  }

  public updates(numTicks: number): void {
    let i;
    for (i = 0; i < numTicks; i++) {
      this.lastTick += this.tickLength;
      this.update(this.lastTick);
    }
  }

  public drawBuckets(): void {
    const numPixels = this.stage.canvas.width * this.stage.canvas.height;
    for (let i = 0; i < numPixels; i++) {
      const x = i % this.stage.canvas.width;
      const y = (i / this.stage.canvas.width) | 0;
      const pct =
        (100 * this.stage.spatialManager.idForPoint(new Point2(x, y))) /
        this.stage.spatialManager.numBuckets;
      if (this.ctx) {
        this.ctx.fillStyle = `hsl(270, 10%, ${pct}%)`;
        this.ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  public draw(): void {
    if (this.ctx) {
      this.ctx.clearRect(
        0,
        0,
        this.stage.canvas.width,
        this.stage.canvas.height
      );
    }
    if (this.ctx) {
      this.ctx.save();
    }
    const deviceWidth = this.stage.canvas.width;
    const deviceHeight = this.stage.canvas.height;
    const scaleFitNative = Math.min(
      deviceWidth / nativeWidth,
      deviceHeight / nativeHeight
    );
    // const scaleFillNative = Math.max(deviceWidth / nativeWidth, deviceHeight / nativeHeight)
    const scale = scaleFitNative;

    if (this.ctx) {
      this.ctx.setTransform(
        scale,
        0, // or use scaleFillNative
        0,
        scale,
        (deviceWidth / 2) | 0,
        (deviceHeight / 2) | 0
      );
      const offsetDeviceTop = -(deviceHeight / scale) / 2;
      const offsetDeviceLeft = -(deviceWidth / scale) / 2;
      this.ctx.translate(offsetDeviceLeft, offsetDeviceTop);
      // console.log(scale, deviceWidth, deviceHeight, this.stage.xmax, this.stage.ymax)
      const fs = 70;
      for (let i = 0; i < this.stage.items.length; i++) {
        this.ctx.save();
        this.stage.items[i].draw(this.ctx, this.debug.on);
        this.ctx.restore();
      }
      this.ctx.restore();

      if (this.debug.on) {
        this.ctx.font = "64px roboto";
        this.ctx.fillText(this.debug.fps.toFixed(1), 0, fs);
        this.ctx.fillText(this.debug.itemL + "", 0, fs * 2);
        this.ctx.fillText(this.debug.numUpdates + "", 0, fs * 3);
        this.ctx.fillText(
          this.debug.text,
          this.stage.canvas.width / 2,
          this.stage.canvas.height / 2
        );

        this.ctx.stroke(this.hatches);
        this.ctx.strokeStyle = "green";
        this.ctx.lineWidth = 3;
        this.hitboxes.forEach(
          (xy: Point2): void | null =>
            this.ctx && this.ctx.strokeRect(xy.x, xy.y, cellSize, cellSize)
        );
        this.ctx.restore();
      }
    }
  }

  /* eslint-disable no-mixed-operators */
  // I don't remember what the intended order of ops is on this
  boundNTick(i: Obj, tickTime: number): boolean {
    i.tick(tickTime);
    const x = i.geo.pos.x + i.geo.v.x;
    const y = i.geo.pos.y + i.geo.v.y;
    i.geo.v.x += i.geo.acc.x;
    i.geo.v.y += i.geo.acc.y;
    let cull = false;

    if (
      ((i.geo.v.x <= 0 || x < this.stage.xmax - i.geo.aabb.max.x) &&
        (i.geo.v.x >= 0 || x > this.stage.xmin)) ||
      (!i.boundToCanvas && x < this.stage.xmax && x > -100)
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
      (!i.boundToCanvas && y < this.stage.ymax && y > -100)
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
  /* eslint-enable no-mixed-operators */

  // o other object
  testIntersect(item: Obj, i: number, o: Obj, cullQ: number[]): void {
    if (item !== o && item.geo.intersectsWith(o.geo)) {
      item.intersects(o, i, cullQ);
    }
  }

  update(tickTime: number): void {
    if (this.ctrl.pause) {
      this.togglePause();
    }
    const cullQ = [];
    if (Math.random() > 0.99) {
      this.stage.items.push(
        new Roid(
          roidPosFactory(this.stage.canvas.width, this.stage.canvas.height),
          this.stage
        )
      );
    }

    this.stage.spatialManager.clearMap();
    for (let i = 0; i < this.stage.items.length; i++) {
      if (this.boundNTick(this.stage.items[i], tickTime)) {
        cullQ.push(i);
      }
    }

    if (this.debug.on) {
      this.hitboxes = new Set();
      for (let i = 0; i < this.stage.canvas.width; i += cellSize) {
        for (let j = 0; j < this.stage.canvas.height; j += cellSize) {
          this.hitboxes.add(new Point2(i, j));
        }
      }
    }
    let i;

    /**
     * for every item on stage, look for items nearby and test whether they intersect
     */
    for (i = 0; i < this.stage.items.length; i++) {
      // for (let j = 0; j < this.stage.items.length; j++) {
      // if (i !== j) {
      // this.testIntersect(this.stage.items[i], i, this.stage.items[j], cullQ)
      // }
      // }
      for (const o of this.stage.spatialManager.getNearby(
        this.stage.items[i].geo
      )) {
        this.testIntersect(this.stage.items[i], i, o, cullQ);
      }
    }

    let culled = 0;
    cullQ.sort(function(a, b): number {
      if (a < b) {
        return -1;
      }
      return a > b ? 1 : 0;
    });
    cullQ.forEach((v): Obj[] => this.stage.items.splice(v - culled++, 1));
  }

  messageModal(msg: string[]): void {
    if (this.ctx) {
      const x = this.stage.canvas.width / 2;
      const y = this.stage.canvas.height / 2;
      this.ctx.textAlign = "center";
      this.ctx.font = "64px roboto";
      this.ctx.fillText(msg[0], x, y);
      if (msg.length > 1) {
        this.ctx.font = "48px roboto";
        this.ctx.fillText(msg[1], x, y + 72);
      }
      this.ctx.restore();
    }
  }

  showInstructions(): void {
    const msg = [];
    if (this.isTouchInterface) {
      msg[0] = "Tap to start";
    } else {
      msg[0] = "Click to start";
    }

    if (this.isTouchInterface) {
      msg[1] = "drag to move the craft";
    } else {
      msg[1] = "use wasd/arrow keys to move, spacebar to fire";
    }

    this.messageModal(msg);
  }

  showPause(): void {
    const msg = [];

    if (this.isTouchInterface) {
      msg[0] = "Tap to resume";
    } else {
      msg[0] = "Press space to resume";
    }

    this.messageModal(msg);
  }

  pausedOnKeyUp(e: KeyboardEvent): void {
    if (!this.stopMain && e.keyCode === 32) {
      this.resume();
    }
  }

  pausedOnTap(e: TouchEvent): void {
    if (!this.stopMain) {
      this.resume();
    }
  }

  _pause(): void {
    window.cancelAnimationFrame(this.stopMain);
    this.stopMain = 0;
  }

  togglePause(): void {
    if (this.stopMain) {
      this._pause();
    } else {
      this.resume();
    }
  }

  pause(): void {
    this._pause();
    this.showPause();
  }

  resume(): void {
    // prevents the engine from trying to catch up from all the lost cycles
    // before pause
    this.lastTick = window.performance.now();
    this.main(this.lastTick);
  }
}
