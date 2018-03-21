'use strict'

var $ = require('jquery')
window.jQuery = window.$ = $
var _ = require('lodash')
window._ = _
var Popper = require('./lib/popper.min.js')
window.Popper = Popper
import * as bitcoin from 'bitcoinjs-lib'
window.bitcoin = bitcoin
require('./lib/bootstrap.min.js')

import {Promise} from 'es6-promise'

import * as cell from '@intercellular/cell'
import * as device from './device.js'
import {showInfo, showError, loading, notLoading} from './messages.js'
import {loadDeviceHandler} from './load_device_handler.js'
import {multisigSetupHandler} from './multisig_setup_handler.js'
import {signingHandler} from './signing_handler.js'
import {debuggerHandler} from './debugger_handler.js'
import * as helpers from './helpers.js'
import {hamlism} from './lib/hamlism.js'

window.app = {
  $cell: true,
  $type: 'body',
  $virus: hamlism,
	class: 'container',
  $components: [
		helpers.tabs({
			"Signing": signingHandler(),
			"Multisig Setup": multisigSetupHandler(),
			"Load Device": loadDeviceHandler(),
			"Debugger": debuggerHandler()
		})
  ],
	$init(){
		helpers.show_tab('signing')
	}
}

cell.God.plan(window);
window.addEventListener('load', function(){ cell.God.create(this) });
