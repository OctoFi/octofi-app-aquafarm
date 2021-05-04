import getConfig from '../../../config/index.js'

const config = getConfig();
export function dirSwitch (type) {
  if (config.reverseSwitch) {
    if (type) return 0
    else return 1
  } else {
    if (type) return 1
    else return 0
  }
}