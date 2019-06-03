import Stage from './Stage'
import Projectile from './Projectile'
import Point2 from './Point2'
import Vector2 from './Vector2'
import { generateStage, generateObj } from './spec-helper'

describe('Projectile', () => {
  let projectile: Projectile
  let stage: Stage
  beforeEach(() => {
    stage = generateStage()
    projectile = new Projectile(new Point2(), new Vector2(), stage)
  })
  it('decrements health on intersection', () => {
    let cullQ: number[] = []
    let o = generateObj(stage)
    const preProjectileHealth = projectile.health
    projectile.intersects(o, 0, cullQ)
    expect(preProjectileHealth - 10).toBe(projectile.health)
  })
})
