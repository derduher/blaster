import { stagePadding } from './config.js'
import Craft from './Craft'
import SpatialManager from './SpatialManager'
import Obj from './Object'
export default class Stage {
  public items: Obj[]
  public padding: number
  public craft?: Craft
  public xmax: number
  public xmin: number
  public ymin: number
  public ymax: number
  public constructor (public canvas: HTMLCanvasElement, public spatialManager: SpatialManager) {
    this.items = []
    this.padding = stagePadding
    this.xmax = 1920
    this.xmin = 0
    this.ymin = 0
    this.ymax = 1080
  }
}
