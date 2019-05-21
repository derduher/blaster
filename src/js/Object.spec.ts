import Stage from './Stage'
import Geo from './Geo'
import Point2 from './Point2'
import Obj from './Object'
import SpatialManager from './SpatialManager'
describe('Object', () => {
  let stage:Stage
  let o:Obj
  beforeEach(() => {
    stage = new Stage(document.createElement('canvas'), new SpatialManager(1000, 1000, 10))
    o = new Obj(new Point2(0, 0), stage, [new Point2()])
  })

  it('decrements health on intersection', () => {
    let cullQ: number[] = []
    let o2 = new Obj(new Point2(0, 0), stage, [new Point2()])
    const preObjHealth = o.health
    o.intersects(o2, 0, cullQ)
    expect(preObjHealth - 10).toBe(o.health)
    expect(cullQ[0]).toBe(0)
  })
})
