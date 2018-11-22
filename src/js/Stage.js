import { stagePadding } from './config.js'
export default class Stage {
  constructor (canvas) {
    this.items = []
    this.spatialManager = null
    this.canvas = canvas
    this.padding = stagePadding
    this.craft = null
    this.xmax = 1920
    this.xmin = 0
    this.ymin = 0
    this.ymax = 1080
  }
}
