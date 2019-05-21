import Stage from './Stage'
import Projectile from './Projectile'
import Geo from './Geo'
import Point2 from './Point2'
import Vector2 from './Vector2'
import Obj from './Object'
import SpatialManager from './SpatialManager'

describe('Projectile', () => {
  let projectile:Projectile
  let stage:Stage
  beforeEach(() => {
    stage = new Stage(document.createElement('canvas'), new SpatialManager(1000, 1000, 10))
    projectile = new Projectile(new Point2(), new Vector2(), stage)
  })
  it('decrements health on intersection', () => {
    let cullQ: number[] = []
    let o = new Obj(new Point2(0, 0), stage, [new Point2()])
    const preProjectileHealth = projectile.health
    projectile.intersects(o, 0, cullQ)
    expect(preProjectileHealth - 10).toBe(projectile.health)
  })
})
