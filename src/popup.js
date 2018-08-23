'use strict'

import $ from 'jquery'
import TrezorConnect from 'trezor-connect'
import _ from 'lodash'
import Popper from './lib/popper.min.js'
import * as bitcoin from 'bitcoinjs-lib'

import {multisigSetupHandler} from './multisig'
import {signingHandler} from './signing_handler.js'
import {walletHandler} from './wallets_handler.js'
import {rskHandler} from './rsk_handler.js'
import {hamlism} from './lib/hamlism'
import {tabbism} from './lib/bootstrapism'
import {updateEpidemic} from './lib/update_epidemic.js'

window.TrezorConnect = TrezorConnect
window.jQuery = window.$ = $
window._ = _
window.Popper = Popper
window.bitcoin = bitcoin
require('./lib/bootstrap.min.js')

window.app = {
  $cell: true,
  $tag: 'body.container',
  $virus: [hamlism, tabbism, updateEpidemic],
  _networkName: 'bitcoin',
  _network () {
    switch (this._networkName) {
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
    walletHandler(),
    rskHandler()
  ]
}
