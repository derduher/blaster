export default class Stage {
  constructor (canvas) {
    this.items = []
    this.spatialManager = null
    this.canvas = canvas
    this.padding = 3
    this.craft = null
  }
}
