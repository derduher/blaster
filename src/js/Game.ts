import Stage from "./Stage";
import SpatialHash from "./SpatialHash";
import Craft from "./Craft";
import Point2 from "./Point2";
import Obj from "./Object";
import Controls from "./Controls";
import World from "./World";
import Renderer, { DebugStats } from "./Renderer";
import {
  fpsFilter,
  cellSize,
  nativeWidth,
  nativeHeight,
  tickLength,
  craft,
} from "./config";

const debug: DebugStats = {
  on: false,
  fps: 50,
  text: "",
  numUpdates: 0,
  itemL: 0,
  drawRate: 250,
  lastRender: Number.POSITIVE_INFINITY,
};

/**
 * Composition root and fixed-timestep game loop. Simulation lives in
 * World, drawing in Renderer; Game wires input and drives both.
 */
export default class Game {
  public updateIsReady: boolean;
  private applyUpdate?: (reloadPage?: boolean) => Promise<void>;
  public lastRender: number;
  public ctrl: Controls;
  public started: boolean;
  public stage: Stage;
  public world: World;
  public renderer: Renderer;
  public lastTick: number;
  public isTouchInterface: boolean;
  public craft: Craft;
  public tickLength: number;
  public stopMain: number;
  public debug: DebugStats;
  public constructor(canvas: HTMLCanvasElement) {
    this.stopMain = 0;
    this.updateIsReady = false;
    this.debug = debug;
    this.lastRender = window.performance.now();
    this.tickLength = tickLength;
    this.ctrl = new Controls();
    this.lastTick = this.lastRender;
    this.debug.lastRender = this.lastRender;

    this.stage = new Stage(
      canvas,
      new SpatialHash<Obj>(nativeWidth, nativeHeight, cellSize),
    );
    this.world = new World(this.stage);
    this.renderer = new Renderer(this.stage);
    this.started = false;

    this.isTouchInterface = "ontouchend" in document.documentElement;

    this.stage.canvas.addEventListener("click", (): void => {
      if (this.isTouchInterface || this.started) {
        this.stage.canvas.requestFullscreen?.();
      }
      if (!this.stopMain) {
        this.resume();
      }
    });
    document.addEventListener("keyup", this.pausedOnKeyUp.bind(this));
    document.addEventListener("keyup", this.ctrl.ku.bind(this.ctrl));
    document.addEventListener("keydown", this.ctrl.kd.bind(this.ctrl));
    window.addEventListener("resize", (): void =>
      this.updateCanvasBoundaries(),
    );
    // keys released while unfocused would otherwise stick
    window.addEventListener("blur", (): void => this.ctrl.reset());

    const onTouch = (e: TouchEvent): void => {
      const t = e.touches[0];
      if (t) {
        const native = this.deviceToNative(t.clientX, t.clientY);
        this.ctrl.setTouch(native.x, native.y);
      }
      e.preventDefault?.();
    };
    this.stage.canvas.addEventListener("touchstart", onTouch);
    this.stage.canvas.addEventListener("touchmove", onTouch);
    this.stage.canvas.addEventListener("touchend", (): void =>
      this.ctrl.clearTouch(),
    );

    this.craft = new Craft(
      this.stage,
      this.ctrl,
      new Point2(
        nativeWidth / 2 - craft.width / 2,
        nativeHeight - craft.width - this.stage.padding,
      ),
    );
    this.stage.spatialManager.registerObject(this.craft, this.craft.geo);
    this.stage.items.push(this.craft);
    this.stage.craft = this.craft;

    this.updateCanvasBoundaries();
  }

  public get ctx(): CanvasRenderingContext2D | null {
    return this.renderer.ctx;
  }

  public updateReady(
    applyUpdate: (reloadPage?: boolean) => Promise<void>,
  ): void {
    this.updateIsReady = true;
    this.applyUpdate = applyUpdate;
  }

  public main(tFrame: number): void {
    this.started = true;
    let timeSinceTick;
    const nextTick = this.lastTick + this.tickLength;
    let numTicks = 0;
    let ud = false;
    let thisFrameFPS: number;

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
      // consume the toggle: it's a one-shot action, not a held state
      this.ctrl.toggleFS = false;
      this.pause();
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        this.stage.canvas.requestFullscreen?.();
      }
      // don't let this frame's draw() wipe the pause overlay
      return;
    }

    // If tFrame < nextTick then 0 ticks need to be updated (0 is default for numTicks).
    // If tFrame = nextTick then 1 tick needs to be updated (and so forth).
    if (tFrame > nextTick) {
      timeSinceTick = tFrame - this.lastTick;
      numTicks = (timeSinceTick / this.tickLength) | 0;
      if (numTicks > 4) {
        numTicks = 4;
        // drop the unpaid time debt, or the game fast-forwards at 4x
        // after every stall until game time catches up to wall time
        this.lastTick = tFrame - numTicks * this.tickLength;
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
    this.renderer.resize();

    // the spatial hash indexes native space, which never changes size;
    // re-register everything only because a redraw may need it below
    this.stage.spatialManager.clearMap();
    this.stage.items.forEach((i): void =>
      this.stage.spatialManager.registerObject(i, i.geo),
    );

    // resizing wipes the canvas; restore whatever screen was showing
    if (!this.started) {
      this.showInstructions();
    } else if (!this.stopMain) {
      this.draw();
      this.showPause();
    }
  }

  public updates(numTicks: number): void {
    for (let i = 0; i < numTicks; i++) {
      this.lastTick += this.tickLength;
      this.update(this.lastTick);
    }
  }

  public update(tickTime: number): void {
    if (this.ctrl.pause) {
      this.ctrl.pause = false;
      this.togglePause();
    }
    this.world.step(tickTime);
  }

  public draw(): void {
    this.renderer.draw(this.debug);
  }

  messageModal(msg: string[]): void {
    this.renderer.messageModal(msg);
  }

  deviceToNative(x: number, y: number): Point2 {
    return this.renderer.deviceToNative(x, y);
  }

  showInstructions(): void {
    const msg = [];
    if (this.isTouchInterface) {
      msg[0] = "Tap to start";
      msg[1] = "drag to move the craft";
    } else {
      msg[0] = "Click to start";
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

    if (this.updateIsReady && !this.isTouchInterface) {
      msg[1] = "update available - press U to apply";
    }

    this.messageModal(msg);
  }

  pausedOnKeyUp(e: KeyboardEvent): void {
    if (!this.stopMain && e.code === "Space") {
      this.resume();
    }

    if (!this.stopMain && e.code === "KeyU" && this.applyUpdate) {
      this.applyUpdate(true);
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
