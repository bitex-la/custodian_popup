import {hamlism} from './lib/hamlism.js'
import {update_epidemic} from './lib/update_epidemic.js'
import {select_object_groupism, select_groupism, form_groupism, buttonism, buttonism_with_size} from './lib/bootstrapism.js'

import {walletService} from './services/wallet_service.js'

export function walletHandler() {
  return {
    id: 'wallets',
    $virus: update_epidemic,
    class: 'form',
    _wallet_type: '',
    _address: '',
    _addresses: [],
    _wallet: {},
    _wallets: [],
    _addWallets(wallets) {
      this._wallets = wallets
      this._addresses = []
    },
    _addAddresses(addresses) {
      this._addresses = addresses
    },
    _getStrAddress(address) {
      switch(this._wallet_type) {
        case '/plain_wallets':
          return address.id
          break
        default:
          return address.attributes.address
      }
    },
    $$: [
      { $virus: select_object_groupism('Wallet Type', [
          {id: '', text: 'Select a type wallet'},
          {id: '/plain_wallets', text: 'Plain'},
          {id: '/hd_wallets', text: 'Hd'},
          {id: '/multisig_wallets', text: 'Multisig'}], 'plain_wallet'),
        name: 'wallet_type',
        onchange(e) {
          let self = this
          this._wallet_type = e.target.value
          walletService().list(self._wallet_type,
            (successData) => self._addWallets(_.map(successData.data, (wallet) => { return {id: wallet.id, version: wallet.attributes.version}})),
            (errorData) => console.log(errorData))
        }
      },
      {
        class: 'well',
        $$: [
          {
            $tag: 'table.table',
            $$: [
              {
                $tag: 'thead',
                $$: [
                  {
                    $tag: 'tr',
                    $$: [
                      { $tag: 'th', $text: 'Id' },
                      { $tag: 'th', $text: 'Version' },
                      { $tag: 'th', $text: '' }
                    ]
                  }
                ]
              },
              {
                $tag: 'tbody',
                _fillWallet(wallet) {
                  let self = this
                  return {
                    $tag: 'tr',
                    $virus: hamlism,
                    $$: [
                      { $tag: 'td', $text: wallet.id },
                      { $tag: 'td', $text: wallet.version },
                      { $virus: buttonism_with_size('Show Addresses', 'info', 'small'),
                        onclick() { 
                          document.getElementsByClassName('addresses-table')[0].classList.remove('d-none')
                          walletService().list(`${self._wallet_type}/${wallet.id}/relationships/addresses`,
                            (successData) => self._addAddresses(_.map(successData.data, (address) => { return self._getStrAddress(address) })),
                            (errorData) => console.log(errorData)) } 
                      }
                    ]
                  }
                },
                $update() {
                  this.innerHTML = ''
                  _.each(this._wallets, (w) => this.$build(this._fillWallet(w)))
                }
              }
            ]
          },
          {
            $tag: 'table.table.d-none.addresses-table',
            $$: [
              {
                $tag: 'thead',
                $$: [ { $tag: 'tr', $$: [ { $tag: 'th', $text: 'Address' } ] } ]
              },
              {
                $tag: 'tbody',
                _fillAddress(address) {
                  let self = this
                  return {
                    $tag: 'tr',
                    $virus: hamlism,
                    $$: [ { $tag: 'td', $text: address } ]
                  }
                },
                $update() {
                  this.innerHTML = ''
                  _.each(this._addresses, (a) => this.$build(this._fillAddress(a)))
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
