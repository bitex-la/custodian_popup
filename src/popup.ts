import * as $ from 'jquery';
import * as _ from 'lodash';
import * as Popper from './lib/popper.min.js';
import * as bitcoin from 'bitcoinjs-lib';

import { multisigSetupHandler } from './multisig/index';
import { signingHandler } from './signing_handler';
import { walletHandler } from './wallets_handler';
import { rskHandler } from './rsk_handler';
import { hamlism } from './lib/hamlism';
import { tabbism } from './lib/bootstrapism';
import { updateEpidemic } from './lib/update_epidemic';

(<any> window).TrezorConnect = require('trezor-connect').default;
(<any> window).jQuery = (<any> window).$ = $;
(<any> window)._ = _;
(<any> window).Popper = Popper;
(<any> window).bitcoin = bitcoin;
require('./lib/bootstrap.min.js');

(<any> window).app = {
  $cell: true,
  $tag: 'body.container',
  $virus: [hamlism, tabbism, updateEpidemic],
  _networkName: 'bitcoin',
  _network () {
    switch (this._networkName) {
      case 'rsk':
      case 'rsk_testnet':
        return (<any> window).bitcoin.networks['bitcoin']
      default:
        return (<any> window).bitcoin.networks[this._networkName]
    }
  },
  $$: [
    signingHandler(),
    multisigSetupHandler(),
    walletHandler(),
    rskHandler()
  ]
}
