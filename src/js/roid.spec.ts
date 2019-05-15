import Roid from './Roid'
import genPos from './roidPosFactory'
import Stage from './Stage'

describe('Roid', () => {
  let roid: Roid
  beforeEach(() => {
    roid = new Roid(genPos(1000, 1000), new Stage(document.createElement('canvas')))
  })
  it('generates random points', () => {
    expect(roid.geo.points.length).toBeGreaterThan(2)
    expect((new Roid(genPos(1000, 1000), new Stage(document.createElement('canvas')))).geo.points[0].x).not.toBe(roid.geo.points[0].x)
  })
})
