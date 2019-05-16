// @ts-ignore: No idea how to handle dynamic props on document
import { fullScreenElementProp } from './fullscreen'

interface keyBindings {
  [index: number]: string
}

interface document {
  [index: string]: any
}

const a = 65
const d = 68
const w = 87
const s = 83
const q = 81
const r = 82
const t = 84
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
  l: boolean
  r: boolean
  u: boolean
  d: boolean
  f: boolean
  weaponNext: boolean
  weaponPrev: boolean
  toggleFS: boolean
  p: boolean
  autoBreak: boolean
  touch: boolean
  touchX: number
  touchY: number
  toggle: Set<string>
  pressActivated: Set<string>
  cfg: keyBindings
  [index: string]: any

  constructor () {
    this.touch = false
    this.touchX = 0
    this.touchY = 0
    this.l = false
    this.r = false
    this.u = false
    this.d = false
    this.f = false
    this.weaponNext = false
    this.weaponPrev = false
    this.toggleFS = false
    this.p = false
    this.autoBreak = false

    this.cfg = {}
    this.cfg[a] = this.cfg[left] = 'l'
    this.cfg[d] = this.cfg[right] = 'r'
    this.cfg[w] = this.cfg[up] = 'u'
    this.cfg[s] = this.cfg[down] = 'd'
    this.cfg[space] = 'f'
    this.cfg[q] = 'weaponPrev'
    this.cfg[e] = 'weaponNext'
    this.cfg[esc] = 'toggleFS'
    this.cfg[r] = 'autoBreak'
    this.cfg[f] = 'p'

    this.pressActivated = new Set(['l', 'r', 'u', 'd', 'p', 'weaponNext', 'weaponPrev', 'f'])
    this.toggle = new Set(['autoBreak', 'toggleFS'])
  }

  /* istanbul ignore next */
  kd (e : KeyboardEvent) {
    const action = this.cfg[e.keyCode]
    if (this.pressActivated.has(action)) {
      this[action] = true
    }
  }

  /* istanbul ignore next */
  ku (e : KeyboardEvent) {
    const action = this.cfg[e.keyCode]
    if (this.pressActivated.has(action)) {
      this[action] = false
    }

    if (this.toggle.has(action)) {
      this[action] = !this[action]
    }
  }

  /* istanbul ignore next */
  ts (e : TouchEvent) {
    // @ts-ignore: No idea how to handle dynamic props on document
    if (document[fullScreenElementProp]) {
      this.touch = true
      e.preventDefault()
    }
  }

  /* istanbul ignore next */
  tm (e : TouchEvent) {
    // @ts-ignore: No idea how to handle dynamic props on document
    if (document[fullScreenElementProp]) {
      var t = e.changedTouches[0]
      this.touchX = t.pageX
      this.touchY = t.pageY
      this.f = true
      e.preventDefault()
    }
  }

  /* istanbul ignore next */
  te (e : TouchEvent) {
    this.touch = false
    this.f = false
    // @ts-ignore: No idea how to handle dynamic props on document
    if (document[fullScreenElementProp]) {
      e.preventDefault()
    }
  }
}
