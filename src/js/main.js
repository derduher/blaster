import '../css/normalize.min.css'
import '../css/main.less'
import Game from './Game'
import { onVisibilityChange, visProp } from './visibility'
import runtime from 'serviceworker-webpack-plugin/lib/runtime'
import registerEvents from 'serviceworker-webpack-plugin/lib/browser/registerEvents'
import applyUpdate from 'serviceworker-webpack-plugin/lib/browser/applyUpdate'

let game
function init () {
  game = new Game(document.getElementById('tutorial'))
  onVisibilityChange(function (e) {
    if (game.started && document[visProp]) {
      game.pause()
    }
  })
  if ('serviceWorker' in navigator) {
    const registration = runtime.register().catch(e => {
      console.log('failed to register serviceworker', e)
    })
    registerEvents(registration, {
      onUpdateReady: () => game.updateReady()
    })
  }
}

window.addEventListener('load', init)
