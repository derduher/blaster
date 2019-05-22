import { stagePadding } from './config.js'
import Craft from './Craft'
import SpatialManager from './SpatialManager'
import Obj from './Object'
export default class Stage {
  items: Obj[]
  padding: number
  craft?: Craft
  xmax: number
  xmin: number
  ymin: number
  ymax: number
  constructor (public canvas: HTMLCanvasElement, public spatialManager: SpatialManager) {
    this.items = []
    this.padding = stagePadding
    this.xmax = 1920
    this.xmin = 0
    this.ymin = 0
    this.ymax = 1080
  }
}
