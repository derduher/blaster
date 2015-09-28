'use strict'
var de = document.documentElement
var fullScreenElementProp

var requestFullScreen = de.requestFullscreen || de.mozRequestFullScreen || de.webkitRequestFullScreen || de.msRequestFullscreen
var cancelFullScreen = document.exitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.msExitFullscreen

if (document.fullscreenElement !== undefined) {
  fullScreenElementProp = 'fullscreenElement'
} else if (document.mozFullScreenElement !== undefined) {
  fullScreenElementProp = 'mozFullScreenElement'
} else if (document.webkitFullscreenElement !== undefined) {
  fullScreenElementProp = 'webkitFullscreenElement'
} else if (document.msFullscreenElement !== undefined) {
  fullScreenElementProp = 'msFullscreenElement'
}

export {fullScreenElementProp}

export function toggleFullScreen (el) {
  if (el && !document[fullScreenElementProp]) {
    requestFullScreen.call(el)
  } else {
    cancelFullScreen.call(document)
  }
}
