'use strict'

import $ from 'jquery'
import TrezorConnect from 'trezor-connect'
window.TrezorConnect = TrezorConnect
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
import {multisigSetupHandler} from './multisig'
import {signingHandler} from './signing_handler.js'
import {debuggerHandler} from './debugger_handler.js'
import {walletHandler} from './wallets_handler.js'
import {rskHandler} from './rsk_handler.js'
import {hamlism} from './lib/hamlism.js'
import {tabbism} from './lib/bootstrapism.js'
import {updateEpidemic} from './lib/update_epidemic.js'

window.app = {
  $cell: true,
  $tag: 'body.container',
  $virus: [hamlism, tabbism, updateEpidemic],
  _networkName: 'bitcoin',
  _network() {
    switch(this._networkName) {
      case 'rsk':
      case 'rsk_testnet':
        return window.bitcoin.networks['bitcoin']
      default:
        return window.bitcoin.networks[this._networkName]
    }
  },
  $$: [
    signingHandler(),
    multisigSetupHandler(),
    loadDeviceHandler(),
    debuggerHandler(),
    walletHandler(),
    rskHandler()
  ],
}
