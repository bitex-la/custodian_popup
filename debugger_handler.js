import * as device from './device.js'
import {showSuccess} from './messages.js'
import * as bitcoin from 'bitcoinjs-lib'
import {showError, loading, notLoading} from './messages.js'
let bip32 = require('bip32-path')

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
