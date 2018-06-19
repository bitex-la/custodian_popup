import {hamlism} from './lib/hamlism.js'
import {update_epidemic} from './lib/update_epidemic.js'
import {select_object_groupism, select_groupism, form_groupism, buttonism, buttonism_with_size} from './lib/bootstrapism.js'
import {modal} from './modal.js'

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
    _buildWalletsTable() {
      switch(this._wallet_type) {
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
      modal(),
      { $virus: select_object_groupism('Wallet Type', [
          {id: '', text: 'Select a type wallet'},
          {id: '/plain_wallets', text: 'Plain'},
          {id: '/hd_wallets', text: 'Hd'},
          {id: '/multisig_wallets', text: 'Multisig'}], 'plain_wallet'),
        name: 'wallet_type',
        onchange(e) {
          let self = this
          this._wallet_type = e.target.value
          this._wallets = []
          document.getElementsByClassName('wallets-table')[0].classList.remove('d-none')
          walletService().list(self._wallet_type,
            (successData) => self._addWallets(successData.data),
            (errorData) => console.log(errorData))
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
                    _buildWalletHeaders(header) {
                      return { $tag: 'th', $virus: hamlism, $text: header }
                    },
                    $update() {
                      this.innerHTML = ''
                      _.each(this._buildWalletsTable(), (h) => this.$build(this._buildWalletHeaders(h)))
                    }
                  }
                ]
              },
              {
                $tag: 'tbody',
                _fillWallet(wallet) {
                  let self = this
                  let addressesButton = {
                    $virus: buttonism_with_size('Show Addresses', 'info', 'small'),
                    onclick() { 
                      $('.addresses-table').removeClass('d-none')
                      walletService().list(`${self._wallet_type}/${wallet.id}/relationships/addresses`,
                        (successData) => self._addAddresses(_.map(successData.data, (address) => { return self._getStrAddress(address) })),
                        (errorData) => console.log(errorData)) 
                    }
                  }
                  let utxosButton = {
                    $virus: buttonism_with_size('Show Utxos', 'info', 'small'),
                    onclick() { 
                      $('.addresses-table').addClass('d-none')
                      $('#modalDialog').modal('show')
                      $('#okModalHandler').click(() => {
                        walletService().list(`${self._wallet_type}/${wallet.id}/get_utxos?since=${$('#since-tx').val()}&limit=${$('#limit-tx').val()}`,
                          (successData) => {
                            $('#since-tx').val('')
                            $('#limit-tx').val('')
                            $('.utxos-table').removeClass('d-none')
                            console.log(successData.data)
                          },
                          (errorData) => console.log(errorData))
                      })
                    }
                  }
                  switch(self._wallet_type) {
                    case '/plain_wallets':
                      return { $tag: 'tr',
                               $virus: hamlism,
                               $$: [{ $tag: 'td', $text: wallet.id },
                                    { $tag: 'td', $text: wallet.attributes.version },
                                    { $tag: 'td', $$: [ addressesButton ] },
                                    { $tag: 'td', $$: [ utxosButton ] }] }
                    case '/hd_wallets':
                      return { $tag: 'tr',
                               $virus: hamlism,
                               $$: [{ $tag: 'td', $text: wallet.id },
                                    { $tag: 'td', $text: wallet.attributes.version },
                                    { $tag: 'td', $text: wallet.attributes.xpub.substring(0, 10), title: wallet.attributes.xpub },
                                    { $tag: 'td', $$: [ addressesButton ] },
                                    { $tag: 'td', $$: [ utxosButton ] }] }
                    case '/multisig_wallets':
                      return { $tag: 'tr', 
                               $virus: hamlism,
                               $$: [{ $tag: 'td', $text: wallet.id },
                                    { $tag: 'td', $text: wallet.attributes.version },
                                    { $tag: 'td',
                                      $text: _.map(wallet.attributes.xpubs, (xpub) => xpub.substring(0, 10)).join(', '),
                                      title: wallet.attributes.xpubs.join(', ') },
                                    { $tag: 'td', $text: wallet.attributes.signers }, 
                                    { $tag: 'td', $$: [ addressesButton ] },
                                    { $tag: 'td', $$: [ utxosButton ] }] }
                    default:
                      return []
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
          },
          {
            $tag: 'table.table.d-none.utxos-table',
            $$: [
              {
                $tag: 'thead',
                $$: [ { $tag: 'tr', $$: [ { $tag: 'th', $text: 'Amount' }, { $tag: 'th', $text: 'Previous Hash' }, { $tag: 'th', $text: 'Previous Index' } ] } ]
              },
            ]
          }
        ]
      }
    ]
  }
}
