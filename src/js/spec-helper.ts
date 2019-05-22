import Stage from './Stage'
import SpatialManager from './SpatialManager'
import Point2 from './Point2'
import Obj from './Object'

export function generateStage (spatial = new SpatialManager(1000, 1000, 10)) {
  return new Stage(document.createElement('canvas'), spatial)
}

export function generateObj (stage = generateStage()) {
  return new Obj(new Point2(), stage, [new Point2()])
}
