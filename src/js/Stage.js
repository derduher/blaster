import { stagePadding } from './config.js'
export default class Stage {
  constructor (canvas) {
    this.items = []
    this.spatialManager = null
    this.canvas = canvas
    this.padding = stagePadding
    this.craft = null
  }
}
