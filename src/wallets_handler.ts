import { hamlism } from './lib/hamlism'
import { updateEpidemic } from './lib/update_epidemic'
import { selectGroupism, selectObjectGroupism, buttonismWithSize } from './lib/bootstrapism'
import { showError } from './messages'
import { modal } from './components/utxos_modal.js'
import { modalTx } from './components/output_tx_modal.js'
import { addressesList } from './components/addresses_list.js'
import { utxosList } from './components/utxos_list.js'
import { InTransaction } from './lib/transaction'

import { WalletService } from './services/wallet_service.js'

import * as networks from './lib/networks.js'
import config from './config'

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
      modal(function (since: string, limit: string) {
        let self = this
        let url = ''
        switch (self.type) {
          case 'wallet':
            url = `${self._walletType}/${self._walletId}/get_utxos?since=${since}&limit=${limit}`
            WalletService(config).list(url, (successData: { data: WalletUtxo[] }) => {
              self._since = ''
              self._limit = ''
              self._displayUtxos = 'block'
              self._rawTransaction = successData.data
              self._addUtxos((<any> window)._.map(successData.data, (utxo: WalletUtxo) => {
                return {
                  amount: utxo.attributes.transaction.satoshis,
                  prev_hash: utxo.attributes.transaction.transaction_hash,
                  prev_index: utxo.attributes.transaction.position
                }
              }))
            },
            function (errorData: string) { console.log(errorData) })
            break
          case 'address':
            url = `${self._walletType}/relationships/addresses/${self.address}/get_utxos?since=${since}&limit=${limit}`
            WalletService(config).list(url, (successData: { data: AddressUtxo[] }) => {
              self._since = ''
              self._limit = ''
              self._displayUtxos = 'block'
              self._rawTransaction = successData.data
              self._addUtxos((<any> window)._.map(successData.data, (utxo: AddressUtxo) => {
                return {
                  amount: utxo.attributes.satoshis,
                  prev_hash: utxo.attributes.transaction_hash,
                  prev_index: utxo.attributes.position
                }
              }))
            },
            function (errorData: string) { console.log(errorData) })
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
        onchange (e: Event) {
          let self = this
          this._walletType = (<HTMLInputElement> e.target).value
          this._wallets = []
          document.getElementsByClassName('wallets-table')[0].classList.remove('d-none')
          config.nodeSelected = config._chooseBackUrl(self._networkName)
          WalletService(config).list(self._walletType,
            (successData: { data: any }) => self._addWallets(successData.data),
            (errorData: string) => console.log(errorData))
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
                    onclick () {
                      self._displayUtxos = 'none'
                      self._displayAddresses = 'block'
                      self._walletId = wallet.id

                      let addresses: Address = {};
                      WalletService(config).list(`${self._walletType}/${wallet.id}/relationships/addresses`,
                        (successData: { data: any }) => {
                          (<any> window)._.forEach(successData.data, (address: any) => {
                            addresses[self._getStrAddress(address)] = '0'
                          })

                          let url = `${self._walletType}/${self._walletId}/get_utxos?since=0&limit=1000000`
                          WalletService(config).list(url, (successData: { data: AddressUtxo[] | WalletUtxo[] }) => {
                            (<any> window)._.forEach(successData.data, (rawUtxo: AddressUtxo | WalletUtxo) => {
                              let utxo = (<AddressUtxo> rawUtxo);
                              let addressStr = self._walletType === '/plain_wallets' ? utxo.attributes.address.id : utxo.attributes.address.address
                              addresses[addressStr] += (<WalletUtxo> rawUtxo).attributes.transaction.satoshis
                            })
                            self._addAddresses((<any> window)._.map((<any> window)._.toPairs(addresses), (d: any[]) => (<any> window)._.fromPairs([d])))
                          }, (errorData: string) => showError(errorData))
                        },
                        (errorData: string) => showError(errorData))
                    }
                  };

                  let createTransactionButton = {
                    $virus: buttonismWithSize('Create Transaction', 'primary', 'block'),
                    'data-id': 'create-transaction',
                    'data-toggle': 'modal',
                    'data-target': '#modalDialogTx',
                    onclick () {
                      self._walletId = wallet.id;
                      self._resourceType = 'wallet';
                      let url = `${self._walletType}/${self._walletId}/get_utxos?since=0&limit=1000000`;
                      WalletService(config).list(url, (successData: { data: any }) => {
                        self._rawTransaction = successData.data;
                        let totalAmount: number = (<any> window)._.sum((<any> window)._.map(successData.data, (utxo: WalletUtxo) => utxo.attributes.transaction.satoshis));
                        (<any> document.querySelector('#modalDialogTx'))._totalAmount = totalAmount;
                        (<any> document.querySelector('#modalDialogTx'))._updateAmount();
                      }, (errorData: string) => showError(errorData))
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
