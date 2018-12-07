import * as $ from 'jquery';
import * as _ from 'lodash';
import * as Popper from './lib/popper.min.js';
import * as bitcoin from 'bitcoinjs-lib';

import { multisigSetupHandler } from './multisig/index';
import { signingHandler } from './signing_handler';
import { walletHandler, Wallet } from './wallets_handler';
import { hamlism } from './lib/hamlism';
import { tabbism } from './lib/bootstrapism';
import { updateEpidemic } from './lib/update_epidemic';
import { WalletService } from './services/wallet_service';
import config from './config';

(<any> window).TrezorConnect = require('trezor-connect').default;
(<any> window).jQuery = (<any> window).$ = $;
(<any> window)._ = _;
(<any> window).Popper = Popper;
(<any> window).bitcoin = bitcoin;
(<any> window).wallets = [];

let updateWallet = async () => {
  (<any>window)._.forEach(
    ["/plain_wallets", "/hd_wallets", "/multisig_wallets"],
    async (url: string) => {
      let response = await WalletService(config).list(url);
      if (response.data.length > 0) {
        (<any>window)._.forEach(
          response.data,
          (wallet: Wallet) => {
            (<any> window).wallets.push(wallet);
            (<any> window.document.getElementById('wallets')).$update();
          }
        );
      }
    }
  );
}

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
    walletHandler()
  ]
}

updateWallet();
