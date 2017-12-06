import * as device from './device.js'
import {showSuccess} from './messages.js'

export function debuggerHandler(id){
  return {
    id: id,
    $components: [
			{ $type: 'button',
				$text: 'Setup Debug Session',
				onclick: function(){
					device.run( function(d){
            showSuccess("Device si now available at window.debug_device")
						window.debug_device = d
					})
				}
			},
    ]
  }
}
