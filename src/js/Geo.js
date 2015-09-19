'use strict';
import Vector2 from './Vector2.js';
import Point2 from './Point2.js';

export default class Geo {
  constructor (x=0, y=0, dx=0, dy=0, ax=0, ay=0) {
    this.pos = new Point2(x, y);
    this.v = new Vector2(dx, dy);
    this.acc = new Vector2(ax, ay);
    this.points = [];
    this.aabb = {min: new Point2(), max: new Point2()};
  }
}

  //line segments
  //for (i=0; i < points.length; i+=2) {
    //var bx;
    //if (i === points.length - 2) {
      //bx = points[0];
      //by = points[1];
    //} else {
      //bx = points[i+2];
      //by = points[i+3];
    //}
    //console.log(points[i].toFixed(0), points[i+1].toFixed(0), bx.toFixed(0), by.toFixed(0))
  //}
