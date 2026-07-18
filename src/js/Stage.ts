import { stagePadding, nativeWidth, nativeHeight } from "./config";
import Craft from "./Craft";
import SpatialHash from "./SpatialHash";
import Obj from "./Object";
export default class Stage {
  public items: Obj[];
  public padding: number;
  public craft?: Craft;
  public xmax: number;
  public xmin: number;
  public ymin: number;
  public ymax: number;
  public constructor(
    public canvas: HTMLCanvasElement,
    public spatialManager: SpatialHash<Obj>,
  ) {
    this.items = [];
    this.padding = stagePadding;
    this.xmax = nativeWidth - this.padding;
    this.xmin = this.padding;
    this.ymin = this.padding;
    this.ymax = nativeHeight - this.padding;
  }
}
