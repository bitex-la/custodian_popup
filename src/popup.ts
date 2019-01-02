import * as $ from 'jquery';
import * as Popper from './lib/popper.min.js';
import * as bitcoin from 'bitcoinjs-lib';

import { multisigSetupHandler } from './multisig/index';
import { signingHandler } from './signing_handler';
import { walletHandler, Wallet, Address } from './wallets_handler';
import { hamlism } from './lib/hamlism';
import { tabbism } from './lib/bootstrapism';
import { updateEpidemic } from './lib/update_epidemic';
import { WalletService } from './services/wallet_service';
import { AddressService } from './services/address_service';
import config from './config';

(<any> window).TrezorConnect = require('trezor-connect').default;
(<any> window).jQuery = (<any> window).$ = $;
(<any> window).Popper = Popper;
(<any> window).bitcoin = bitcoin;
(<any> window).wallets = [];

let updateWallet = async () => {
  ["/plain_wallets", "/hd_wallets", "/multisig_wallets"].forEach(
    async (url: string) => {
      let response = await WalletService(config).list(url);
      if (response.data.length > 0) {
        response.data.forEach(
          async (rawWallet: Wallet) => {
            let wallet = Object.assign(new Wallet(), rawWallet);
            wallet.addresses = [];
            (<any> window).wallets.push(wallet);
            if (wallet.id !== 'incoming') {
              let addressResponse = await AddressService(config).list(`${url}/${wallet.attributes.label}/addresses`);
              if (addressResponse.data.length > 0) {
                addressResponse.data.forEach(
                  (address: Address) => {
                    wallet.addresses.push(
                      {
                        attributes: {
                          public_address: address.attributes.public_address, 
                          path: address.attributes.path, 
                          balance: address.attributes.balance
                        }
                      }
                    );
                  });
              }
            }
            let walletTab = <any> window.document.getElementById('wallets');
            if (walletTab) {
              walletTab.$update();
            }
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
  _networkName: 'Bitcoin',
  _network () {
    switch (this._networkName) {
      case 'rsk':
      case 'rsk_testnet':
        return (<any> window).bitcoin.networks['bitcoin']
      default:
        return (<any> window).bitcoin.networks[this._networkName.toLowerCase()]
    }
  },
  $$: [
    signingHandler(),
    multisigSetupHandler(),
    walletHandler()
  ]
}

updateWallet();
