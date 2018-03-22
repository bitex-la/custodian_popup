import * as device from './device.js'
import {showSuccess} from './messages.js'
import {buttonism} from './lib/bootstrapism.js'

export function debuggerHandler(){
  return { id: 'debugger', $$: [
    { $tag: 'p', $text: `A debug session consists on grabbing
       a reference to a trezor device, and making it available
       in window.debug_device so you can inspect it using the
       developer tools in your browser.`
    },
    { $virus: buttonism("Start Debug Session", "warning"),
      onclick: function(){
        device.run( function(d){
          showSuccess("Device is now available at window.debug_device")
          window.debug_device = d
        })
      }
    },
  ]}
}
