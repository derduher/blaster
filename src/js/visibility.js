'use strict'
var visProp = (function getHiddenProp () {
  var prefixes = ['webkit', 'moz', 'ms', 'o']

  // if 'hidden' is natively supported just return it
  if ('hidden' in document) {
    return 'hidden'
  }

  // otherwise loop over all the known prefixes until we find one
  for (var i = 0; i < prefixes.length; i++) {
    if ((prefixes[i] + 'Hidden') in document) {
      return prefixes[i] + 'Hidden'
    }
  }

  // otherwise it's not supported
  return null
})()

var evtname
export function onVisibilityChange (change) {
  if (visProp) {
    evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange'
    document.addEventListener(evtname, change)
  }
}
export { visProp }
