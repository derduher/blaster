import Stage from "./Stage";
import Point2 from "./Point2";
import { nativeWidth, nativeHeight } from "./config";

export interface DebugStats {
  on: boolean;
  fps: number;
  text: string;
  numUpdates: number;
  itemL: number;
  drawRate: number;
  lastRender: number;
}

/**
 * Owns the canvas: sizing (HiDPI aware), the native-to-device transform,
 * entity drawing, the debug overlay, and text modals.
 */
export default class Renderer {
  public ctx: CanvasRenderingContext2D | null;
  private dpr = 1;

  public constructor(private stage: Stage) {
    this.ctx = stage.canvas.getContext("2d");
  }

  // size the backing store in physical pixels so HiDPI screens render
  // crisply; CSS size stays in logical pixels
  public resize(): void {
    this.dpr = window.devicePixelRatio || 1;
    const cssWidth = document.fullscreenElement
      ? window.screen.width
      : window.innerWidth;
    const cssHeight = document.fullscreenElement
      ? window.screen.height
      : window.innerHeight;

    this.stage.canvas.width = (cssWidth * this.dpr) | 0;
    this.stage.canvas.height = (cssHeight * this.dpr) | 0;
    this.stage.canvas.style.width = cssWidth + "px";
    this.stage.canvas.style.height = cssHeight + "px";
  }

  // uniform scale that fits the fixed native space onto the canvas
  private get scale(): number {
    return Math.min(
      this.stage.canvas.width / nativeWidth,
      this.stage.canvas.height / nativeHeight,
    );
  }

  // converts logical (CSS) pixels, e.g. touch/click coordinates, into the
  // fixed native space the simulation runs in
  public deviceToNative(x: number, y: number): Point2 {
    return new Point2((x * this.dpr) / this.scale, (y * this.dpr) / this.scale);
  }

  public draw(debug: DebugStats): void {
    if (!this.ctx) {
      return;
    }
    const deviceWidth = this.stage.canvas.width;
    const deviceHeight = this.stage.canvas.height;
    const scale = this.scale;

    this.ctx.clearRect(0, 0, deviceWidth, deviceHeight);
    this.ctx.save();
    this.ctx.setTransform(
      scale,
      0,
      0,
      scale,
      (deviceWidth / 2) | 0,
      (deviceHeight / 2) | 0,
    );
    this.ctx.translate(-(deviceWidth / scale) / 2, -(deviceHeight / scale) / 2);

    for (const item of this.stage.items) {
      this.ctx.save();
      item.draw(this.ctx, debug.on);
      this.ctx.restore();
    }

    if (debug.on) {
      // occupied broad-phase cells, in the same native space as entities
      this.ctx.strokeStyle = "green";
      this.ctx.lineWidth = 3;
      for (const cell of this.stage.spatialManager.occupiedCells()) {
        this.ctx.strokeRect(cell.x, cell.y, cell.size, cell.size);
      }
    }
    this.ctx.restore();

    if (debug.on) {
      const fs = 70 * this.dpr;
      this.ctx.save();
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = `${64 * this.dpr}px roboto`;
      this.ctx.fillText(debug.fps.toFixed(1), 0, fs);
      this.ctx.fillText(debug.itemL + "", 0, fs * 2);
      this.ctx.fillText(debug.numUpdates + "", 0, fs * 3);
      this.ctx.fillText(debug.text, deviceWidth / 2, deviceHeight / 2);
      this.ctx.restore();
    }
  }

  public messageModal(msg: string[]): void {
    if (!this.ctx) {
      return;
    }
    const x = this.stage.canvas.width / 2;
    const y = this.stage.canvas.height / 2;
    this.ctx.save();
    // resizing the canvas resets context state, so never rely on
    // inherited styles here
    this.ctx.fillStyle = "#ffffff";
    this.ctx.textAlign = "center";
    this.ctx.font = `${64 * this.dpr}px roboto`;
    this.ctx.fillText(msg[0], x, y);
    if (msg.length > 1) {
      this.ctx.font = `${48 * this.dpr}px roboto`;
      this.ctx.fillText(msg[1], x, y + 72 * this.dpr);
    }
    this.ctx.restore();
  }
}
