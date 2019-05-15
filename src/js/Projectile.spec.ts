import Stage from './Stage'
import Projectile from './Projectile'
import Geo from './Geo'
import Point2 from './Point2'
import Obj from './Object'
describe('Projectile', () => {
  let projectile:Projectile
  let stage:Stage
  beforeEach(() => {
    stage = new Stage(document.createElement('canvas'))
    projectile = new Projectile(new Geo(), stage)
  })
  it('decrements health on intersection', () => {
    let cullQ: number[] = []
    let o = new Obj(new Point2(0, 0), stage)
    const preProjectileHealth = projectile.health
    projectile.intersects(o, 0, cullQ)
    expect(preProjectileHealth - 10).toBe(projectile.health)
  })
})
