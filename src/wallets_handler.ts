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

interface Wallet {
  id: string;
  attributes?: {
    version: string;
    xpub: string;
    xpubs: string[];
    signers: number[];
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
    $virus: updateEpidemic,
    class: 'form',
    $$: [{
      $tag: "ul.list-group.wallets-server.mt-3",
      $update() {
        this.innerHTML = "";
        (<any>window)._.forEach((<any> window).wallets, (label: string) => this.$build({
          $type: 'li',
          class: 'list-group-item',
          $text: label
        }));
      }
    }]
  }
}
