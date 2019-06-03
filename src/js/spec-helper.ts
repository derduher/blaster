import Stage from './Stage'
import Point2 from './Point2'
import Obj from './Object'
import SpatialManager from 'spatial-hashmap'

export function generateStage (spatial = new SpatialManager<Obj>(1000, 1000, 10)): Stage {
  return new Stage(document.createElement('canvas'), spatial)
}

export function generateObj (stage = generateStage()): Obj {
  return new Obj(new Point2(), stage, [new Point2()])
}
