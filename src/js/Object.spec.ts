import Stage from './Stage'
import Geo from './Geo'
import Point2 from './Point2'
import Obj from './Object'
describe('Object', () => {
  let stage:Stage
  let o:Obj
  beforeEach(() => {
    stage = new Stage(document.createElement('canvas'))
    o = new Obj(new Point2(0, 0), stage)
  })

  it('decrements health on intersection', () => {
    let cullQ: number[] = []
    let o = new Obj(new Point2(0, 0), stage)
    let o2 = new Obj(new Point2(0, 0), stage)
    const preObjHealth = o.health
    o.intersects(o2, 0, cullQ)
    expect(preObjHealth - 10).toBe(o.health)
    expect(cullQ[0]).toBe(0)
  })
})