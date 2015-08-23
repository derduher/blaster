'use strict';
/*jshint bitwise: false*/
export default class SpatialManager {
  constructor (scenewidth, sceneheight, cellsize) {
    this.SceneWidth = scenewidth;
    this.SceneHeight = sceneheight;
    this.cf = 1/cellsize;

    this.cols = Math.ceil(scenewidth*this.cf);
    this.rows = Math.ceil(sceneheight*this.cf);
    this.buckets = new Map();
    this.numbuckets = this.rows * this.cols;
    this.reverse = {};

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.reverse[x + y*this.cols |0] = {x:x*cellsize, y:y*cellsize};
      }
    }
    console.log(this.reverse);

    this.clearBuckets();
  }
  clearBuckets () {
    this.buckets.clear();
    var i;
    for (i = 0; i < this.numbuckets; i++) {
      this.buckets.set(i, new Set());
    }
  }
  registerObject (obj) {
    var cells = this.getIdForObject(obj);
    var cell, cellId;
    for (cellId of cells) {
      cell = this.buckets.get(cellId);
      if (cell) {
        cell.add(obj);
      }
    }
  }
  getIdForObject (obj) {
    var bucketsObjIsIn = new Set();

    var max = {
      x: obj.x + obj.width,
      y: obj.y + obj.width
    };

    //TopLeft
    this.addBucket(obj.x, obj.y, this.cf, this.cols, bucketsObjIsIn);
    //TopRight
    this.addBucket(max.x, obj.y, this.cf, this.cols, bucketsObjIsIn);
    //BottomRight
    this.addBucket(max.x, max.y, this.cf, this.cols, bucketsObjIsIn);
    //BottomLeft
    this.addBucket(obj.x, max.y, this.cf, this.cols, bucketsObjIsIn);

    return bucketsObjIsIn;
  }
  addBucket (x, y, cf, cols, set) {
    // ignore collisions offscreen
    var id = (x*cf | 0) + (y*cf |0)*cols |0;
    if (id >= 0 && id < this.numbuckets) {
      set.add(id);
    }
  }
  getNearby (obj) {
    var id;
    var nearby = new Set();
    var ids = this.getIdForObject(obj);

    for (id of ids) {
      let bucket = this.buckets.get(id);
      for (let oobj of bucket) {
        nearby.add(oobj);
      }
    }
    return nearby;
  }
}
