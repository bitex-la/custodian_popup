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

interface SingleAddress {
  id: string;
}

interface CompleteAddress {
  attributes: {
    address: string
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
      id?: string;
      address?: string;
    };
  }
}

export function walletHandler () {
  let addresses: string[] = [];
  let wallets: string[] = [];
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
    _walletType: '',
    _walletId: 0,
    _address: '',
    _addresses: addresses,
    _wallet: {},
    _wallets: wallets,
    _utxos: utxos,
    _displayUtxos: 'none',
    _displayAddresses: 'none',
    _rawTransaction: rawTransaction,
    _resourceType: '',
    _addWallets (wallets: string[]) {
      this._wallets = wallets
      this._addresses = []
    },
    _addAddresses (addresses: string[]) {
      this._addresses = addresses
    },
    _addUtxos (utxos: string[]) {
      this._utxos = utxos
    },
    _getStrAddress (address: SingleAddress | CompleteAddress) {
      switch (this._walletType) {
        case '/plain_wallets':
          return (<SingleAddress> address).id
        default:
          return (<CompleteAddress> address).attributes.address
      }
    },
    _buildWalletsTable () {
      switch (this._walletType) {
        case '/plain_wallets':
          return ['Id', 'Version', '', '']
        case '/hd_wallets':
          return ['Id', 'Version', 'XPub', '', '']
        case '/multisig_wallets':
          return ['Id', 'Version', 'XPubs', 'Signers', '', '']
        default:
          return []
      }
    },
    $$: [
      modal(async function (since: string, limit: string) {
        let self = this
        let url = ''
        switch (self.type) {
          case 'wallet':
            url = `${self._walletType}/${self._walletId}/get_utxos?since=${since}&limit=${limit}`;
            try {
              let successData = await WalletService(config).list(url);
              self._since = '';
              self._limit = '';
              self._displayUtxos = 'block';
              self._rawTransaction = successData.data;
              self._addUtxos((<any> window)._.map(successData.data, (utxo: WalletUtxo) => {
                return {
                  amount: utxo.attributes.transaction.satoshis,
                  prev_hash: utxo.attributes.transaction.transaction_hash,
                  prev_index: utxo.attributes.transaction.position
                }
              }));
            } catch(e) {
              showError(e);
            }
            break
          case 'address':
            url = `${self._walletType}/relationships/addresses/${self.address}/get_utxos?since=${since}&limit=${limit}`

            try {
              let successData = await WalletService(config).list(url);
              self._since = '';
              self._limit = '';
              self._displayUtxos = 'block';
              self._rawTransaction = successData.data;
              self._addUtxos((<any> window)._.map(successData.data, (utxo: AddressUtxo) => {
                return {
                  amount: utxo.attributes.satoshis,
                  prev_hash: utxo.attributes.transaction_hash,
                  prev_index: utxo.attributes.position
                }
              }));
            } catch (e) {
              showError(e);
            }
            break
        }
      }),
      { $virus: selectGroupism('Network', (<any> window)._.keys(networks)),
        name: 'network',
        $update () { this.value = this._networkName },
        onchange (e: Event) { this._networkName = (<HTMLInputElement> e.target).value }
      },
      {
        $virus: selectObjectGroupism('Wallet Type',
        [{
          id: '',
          text: 'Select a type wallet'
        },
        {
          id: '/plain_wallets',
          text: 'Plain'
        },
        {
          id: '/hd_wallets',
          text: 'Hd'
        },
        {
          id: '/multisig_wallets',
          text: 'Multisig'
        }], 'plain_wallet'),
        name: 'wallet_type',
        async onchange (e: Event) {
          let self = this
          this._walletType = (<HTMLInputElement> e.target).value
          this._wallets = []
          document.getElementsByClassName('wallets-table')[0].classList.remove('d-none')
          config.nodeSelected = config._chooseBackUrl(self._networkName)
          try {
            let successData = await WalletService(config).list(self._walletType);
            self._addWallets(successData.data);
          } catch (e) {
            showError(e);
          }
        }
      },
      {
        class: 'well',
        $$: [
          {
            $tag: 'table.table.d-none.wallets-table',
            $$: [
              {
                $tag: 'thead',
                $$: [
                  {
                    $tag: 'tr',
                    _buildWalletHeaders (header: string) {
                      return { $tag: 'th', $virus: hamlism, $text: header }
                    },
                    $update () {
                      this.innerHTML = '';
                      (<any> window)._.each(this._buildWalletsTable(), (h: string) => this.$build(this._buildWalletHeaders(h)));
                    }
                  }
                ]
              },
              {
                $tag: 'tbody',
                _fillWallet (wallet: Wallet): any {
                  let self = this
                  let addressesButton = {
                    $virus: buttonismWithSize('Show Addresses', 'info', 'small'),
                    'data-id': 'show-addresses',
                    async onclick () {
                      self._displayUtxos = 'none'
                      self._displayAddresses = 'block'
                      self._walletId = wallet.id

                      let addresses: Address = {};
                      try {
                        let addressesResponse = await WalletService(config).list(`${self._walletType}/${wallet.id}/relationships/addresses`);
                        (<any> window)._.forEach(addressesResponse.data, (address: any) => {
                          addresses[self._getStrAddress(address)] = '0'
                        });

                        try {
                          let url = `${self._walletType}/${self._walletId}/get_utxos?since=0&limit=1000000`;
                          let utxosResponse = await WalletService(config).list(url);
                          (<any> window)._.forEach(utxosResponse.data, (rawUtxo: AddressUtxo | WalletUtxo) => {
                            let utxo = (<AddressUtxo> rawUtxo);
                            let addressStr = self._walletType === '/plain_wallets' ? utxo.attributes.address.id : utxo.attributes.address.address
                            addresses[addressStr] += (<WalletUtxo> rawUtxo).attributes.transaction.satoshis
                          });
                          self._addAddresses((<any> window)._.map((<any> window)._.toPairs(addresses), (d: any[]) => (<any> window)._.fromPairs([d])));
                        } catch (e) {
                          showError(e);
                        }
                      } catch (e) {
                        showError(e);
                      }
                    }
                  };

                  let createTransactionButton = {
                    $virus: buttonismWithSize('Create Transaction', 'primary', 'block'),
                    'data-id': 'create-transaction',
                    'data-toggle': 'modal',
                    'data-target': '#modalDialogTx',
                    async onclick () {
                      self._walletId = wallet.id;
                      self._resourceType = 'wallet';
                      let url = `${self._walletType}/${self._walletId}/get_utxos?since=0&limit=1000000`;
                      try {
                        let successData = await WalletService(config).list(url);
                        self._rawTransaction = successData.data;
                        let totalAmount: number = (<any> window)._.sum((<any> window)._.map(successData.data, (utxo: WalletUtxo) => utxo.attributes.transaction.satoshis));
                        (<any> document.querySelector('#modalDialogTx'))._totalAmount = totalAmount;
                        (<any> document.querySelector('#modalDialogTx'))._updateAmount();
                      } catch (e) {
                        showError(e);
                      }
                    }
                  };

                  switch (self._walletType) {
                    case '/plain_wallets':
                      return {
                        $tag: 'tr',
                        $virus: hamlism,
                        $$: [
                          {
                            $tag: 'td',
                            $text: wallet.id
                          },
                          {
                            $tag: 'td',
                            $text: wallet.attributes.version
                          },
                          {
                            $tag: 'td',
                            $$: [addressesButton]
                          },
                          {
                            $tag: 'td',
                            $$: [createTransactionButton]
                          }
                        ]
                      }
                    case '/hd_wallets':
                      return {
                        $tag: 'tr',
                        $virus: hamlism,
                        $$: [
                          {
                            $tag: 'td',
                            $text: wallet.id
                          },
                          {
                            $tag: 'td',
                            $text: wallet.attributes.version
                          },
                          {
                            $tag: 'td',
                            $text: wallet.attributes.xpub.substring(0, 10),
                            title: wallet.attributes.xpub
                          },
                          {
                            $tag: 'td',
                            $$: [addressesButton]
                          },
                          {
                            $tag: 'td',
                            $$: [createTransactionButton]
                          }
                        ]
                      }
                    case '/multisig_wallets':
                      return {
                        $tag: 'tr',
                        $virus: hamlism,
                        $$: [
                          {
                            $tag: 'td',
                            $text: wallet.id
                          },
                          {
                            $tag: 'td',
                            $text: wallet.attributes.version
                          },
                          {
                            $tag: 'td',
                            $text: (<any> window)._.map(wallet.attributes.xpubs, (xpub: string) => xpub.substring(0, 10)).join(', '),
                            title: wallet.attributes.xpubs.join(', ')
                          },
                          {
                            $tag: 'td',
                            $text: wallet.attributes.signers
                          },
                          {
                            $tag: 'td',
                            $$: [addressesButton]
                          },
                          {
                            $tag: 'td',
                            $$: [createTransactionButton]
                          }
                        ]
                      }
                    default:
                      return []
                  }
                },
                $update () {
                  this.innerHTML = '';
                  (<any> window)._.each(this._wallets, (w: string) => this.$build(this._fillWallet(w)));
                }
              }
            ]
          },
          addressesList(), utxosList(), modalTx()
        ]
      }
    ]
  }
}
