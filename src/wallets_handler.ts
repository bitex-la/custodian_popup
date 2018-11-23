import { hamlism } from './lib/hamlism';
import { updateEpidemic } from './lib/update_epidemic';
import { selectGroupism, selectObjectGroupism, buttonismWithSize } from './lib/bootstrapism';
import { showError } from './messages';
import { modal } from './components/utxos_modal.js';
import { modalTx } from './components/output_tx_modal.js';
import { addressesList } from './components/addresses_list.js';
import { utxosList } from './components/utxos_list.js';
import { InTransaction } from './lib/transaction';

import { WalletService } from './services/wallet_service';

import * as networks from './lib/networks.js';
import config from './config';

type Address = { [index: string] : string };

interface CompleteAddress {
  attributes: {
    public_address: string
  }
}

export interface Wallet {
  id: string;
  type: string;
  attributes: {
    version: string;
    label: string;
    balance: number;
    xpub?: string;
    xpubs?: string[];
    signers?: number[];
  };
}

interface WalletUtxo {
  attributes: {
    transaction: {
      satoshis: string;
      transaction_hash: string;
      position: string;
    }
  }
}

interface AddressUtxo {
  attributes: {
    satoshis: string;
    transaction_hash: string;
    position: string;
    address?: {
      public_address?: string;
      wallet?: Wallet;
    };
  }
}

export function walletHandler () {
  let addresses: string[] = [];
  let utxos: string[] = [];
  let rawTransaction: InTransaction = {
      outputs: [],
      inputs: [],
      transactions: []
  };

  return {
    id: 'wallets',
    $virus: [updateEpidemic, hamlism],
    class: 'form',
    $$: [{
      $tag: "ul.list-group.wallets-server.list-group-flush.mt-3",
      $update() {
        this.innerHTML = "";
        (<any>window)._.forEach((<any> window).wallets, (wallet: Wallet) => this.$build({
          $type: 'li',
          $virus: hamlism,
          class: 'list-group-item d-flex justify-content-between align-items-center',
          $$: [
            {
              $type: 'div',
              class: 'card',
              $$: [
                {
                  $type: 'div',
                  class: 'card-header',
                  $text: wallet.type
                },
                {
                  $type: 'div',
                  class: 'card-body',
                  $$: [
                    {
                      $type: 'blockquote',
                      class: 'blockquote mb-0',
                      $$: [
                        {
                          $type: 'p',
                          $text: wallet.attributes.label
                        },
                        {
                          $type: 'footer',
                          class: 'blockquote-footer',
                          $text: wallet.attributes.balance
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              $type: 'span',
              class: 'badge badge-primary badge-pill',
              $text: wallet.attributes.balance
            }
          ]
        }));
      }
    }]
  }
}
