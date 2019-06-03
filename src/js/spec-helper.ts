import Stage from './Stage'
import SpatialManager from 'spatial-hashmap'
import Point2 from './Point2'
import Obj from './Object'

export function generateStage(
  spatial = new SpatialManager<Obj>(1000, 1000, 10)
): Stage {
  return new Stage(document.createElement('canvas'), spatial)
}

export function generateObj(stage = generateStage()): Obj {
  return new Obj(new Point2(), stage, [new Point2()])
}
