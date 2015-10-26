'use strict'
import Game from './Game'
import { onVisibilityChange, visProp } from './visibility'

function init () {
  var game = new Game(document.getElementById('tutorial'))
  onVisibilityChange(function (e) {
    if (game.started && document[visProp]) {
      game.pause()
    }
  })
}

document.body.onload = init
