'use strict'

import $ from 'jquery'
window.jQuery = window.$ = $
import _  from 'lodash'
window._ = _
import Popper from './lib/popper.min.js'
window.Popper = Popper
import * as bitcoin from 'bitcoinjs-lib'
window.bitcoin = bitcoin
require('./lib/bootstrap.min.js')

import {Promise} from 'es6-promise'

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
      "Multisig Setup": multisigSetupHandler('multisig_setup'),
      "Signing": signingHandler(),
      "Load Device": loadDeviceHandler('load_device'),
      "Debugger": debuggerHandler('debugger')
    })
  ],
  $init(){
    helpers.show_tab('signing')
  }
}
