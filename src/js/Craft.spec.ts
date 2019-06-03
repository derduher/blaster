import Point2 from './Point2'
import Controls from './Controls'
import Craft from './Craft'
import Projectile from './Projectile'
import { generateStage } from './spec-helper'

describe('Craft', () => {
  let controls: Controls
  let craft: Craft
  beforeEach(() => {
    controls = new Controls()
    craft = new Craft(generateStage(), controls, new Point2())
  })

  describe('tick', () => {
    it('moves left on pressing left control', () => {
      controls.l = true
      craft.tick(1)
      expect(craft.geo.acc.x).toBeLessThan(0)
    })

    it('stops on pressing left and right control', () => {
      controls.l = true
      controls.r = true
      craft.tick(1)
      expect(craft.geo.acc.x).toBe(0)
    })
    it('reverses thrust when autobreak is on', () => {
      controls.autoBreak = true
      craft.geo.v.x = 100
      craft.tick(1)
      expect(craft.geo.acc.x).toBeLessThan(0)
    })
    it('kills acceleration when thrusters are no longer active', () => {
      controls.l = true
      craft.tick(1)
      controls.l = false
      craft.tick(1)
      expect(craft.geo.acc.x).toBe(0)
    })
  })
  
  describe('fire', () => {
    it('marks the last time fire happened', () => {
      craft.fire(10)
      expect(craft.lastFire).toBe(10)
    })

    it('adds the new projectile to the spatialManager', () => {
      spyOn(craft.stage.spatialManager, 'registerObject')
      craft.fire(1)
      expect(craft.stage.spatialManager.registerObject).toHaveBeenCalled()
    })

    it('adds the new projectile the stage', () => {
      craft.fire(10)
      expect(craft.stage.items[0] instanceof Projectile).toBeTruthy()
    })
  })
})
