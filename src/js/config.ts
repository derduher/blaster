import Point2 from "./Point2";

export const fpsFilter = 75;
export const cellSize = 256;
export const nativeWidth = 1920;
export const nativeHeight = 1080;
export const tickLength = 16.7;

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
    [
      new Point2(19, 38.45),
      new Point2(19, 20),
      new Point2(15, 20),
      new Point2(15, 44.95)
    ],
    [
      new Point2(49, 28.45),
      new Point2(49, 20),
      new Point2(53, 20),
      new Point2(53, 44.95)
    ],
    [
      new Point2(28, 10),
      new Point2(40, 10),
      new Point2(58, 66),
      new Point2(10, 66)
    ]
  ],
  thruster: {
    up: [
      new Point2(32, 0),
      new Point2(37, 0),
      new Point2(37, 10),
      new Point2(32, 10)
    ],
    left: [
      new Point2(5, 45),
      new Point2(15, 45),
      new Point2(15, 50),
      new Point2(5, 50)
    ],
    right: [
      new Point2(52, 45),
      new Point2(62, 45),
      new Point2(62, 50),
      new Point2(52, 50)
    ],
    down: [
      new Point2(32, 68),
      new Point2(37, 68),
      new Point2(37, 78),
      new Point2(32, 78)
    ]
  }
};

export const defaultObjMass = 1;
export const projectile = {
  mass: 0.1,
  width: 6,
  health: 10
};

export const roid = {
  numPoints: 12,
  mass: 6e4,
  maxRadius: 28,
  minRadius: 4
};

export const stagePadding = 3;
