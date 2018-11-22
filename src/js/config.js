import Point2 from './Point2.js'

export const fpsFilter = 75
export const cellSize = 256
export const nativeWidth = 1920
export const nativeHeight = 1080
export const tickLength = 16.7

export const craft = {
  mass: 8,
  health: 1000,
  width: 48,
  height: 76,
  barrelLength: 10,
  force: 25,
  speed: 0.1, // m/s
  rateOfFire: 50,
  immortal: true,
  geo: [
    new Point2(9, 28.45),
    new Point2(9, 10),
    new Point2(5, 10),
    new Point2(5, 34.95),

    new Point2(39, 28.45),
    new Point2(39, 10),
    new Point2(43, 10),
    new Point2(43, 34.95),

    new Point2(18, 0),
    new Point2(30, 0),
    new Point2(48, 56),
    new Point2(0, 56)
  ]
}

export const defaultObjMass = 1
export const projectile = {
  mass: 0.1,
  width: 6,
  health: 10
}

export const roid = {
  numPoints: 12,
  mass: 6e4,
  maxRadius: 28,
  minRadius: 4
}

export const stagePadding = 3
