import { fullScreenElementProp } from './fullScreen'

const a = 65
const d = 68
const w = 87
const s = 83
const q = 81
const space = 32
const left = 37
const right = 39
const up = 38
const down = 40
const esc = 27
const f = 70
// const r = 82
const e = 69

export default class Controls {
  constructor () {
    this.cfg = {}
    this.cfg[a] = this.cfg[left] = 'l'
    this.cfg[d] = this.cfg[right] = 'r'
    this.cfg[w] = this.cfg[up] = 'u'
    this.cfg[s] = this.cfg[down] = 'd'
    this.cfg[space] = 'f'
    this.cfg[q] = 'weaponPrev'
    this.cfg[e] = 'weaponNext'
    this.cfg[esc] = 'toggleFS'
    this.cfg[f] = 'p'
  }

  kd (e) {
    this[this.cfg[e.keyCode]] = true
  }

  ku (e) {
    this[this.cfg[e.keyCode]] = false
  }

  ts (e) {
    if (document[fullScreenElementProp]) {
      this.touch = true
      e.preventDefault()
    }
  }

  tm (e) {
    if (document[fullScreenElementProp]) {
      var t = e.changedTouches[0]
      this.touchX = t.pageX
      this.touchY = t.pageY
      this.f = true
      e.preventDefault()
    }
  }

  te (e) {
    this.touch = false
    this.f = false
    if (document[fullScreenElementProp]) {
      e.preventDefault()
    }
  }
}
