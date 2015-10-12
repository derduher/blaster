'use strict'
import Game from './Game'
import { onVisibilityChange, visProp } from './visibility'

function init () {
  var game = new Game(document.getElementById('tutorial'))
  onVisibilityChange(function (e) {
    if (document[visProp]) {
      game.pause()
    } else {
      game.resume()
    }
  })
}

document.body.onload = init
