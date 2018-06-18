import {hamlism} from './lib/hamlism.js'
import {update_epidemic} from './lib/update_epidemic.js'
import {select_object_groupism, select_groupism, form_groupism, buttonism} from './lib/bootstrapism.js'

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
    },
    $$: [
      { $virus: select_object_groupism('Wallet Type', [{id: '/plain_wallets', text: 'Plain'},
                                                       {id: '/hd_wallets', text: 'Hd'},
                                                       {id: '/multisig_wallets', text: 'Multisig'}], 'plain_wallet'),
        name: 'wallet_type',
        onchange(e) {
          let self = this
          this._wallet_type = e.target.value
          walletService().list(self._wallet_type,
            (success_data) => self._addWallets(_.map(success_data.data, (wallet) => { return {id: wallet.id, version: wallet.attributes.version}})),
            (error_data) => console.log(error_data))
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
                      {
                        $tag: 'th',
                        $text: 'Id'
                      },
                      {
                        $tag: 'th',
                        $text: 'Version'
                      }
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
                      { $tag: 'td', $text: wallet.version }
                    ]
                  }
                },
                $update() {
                  this.innerHTML = ''
                  _.each(this._wallets, (w) => this.$build(this._fillWallet(w)))
                }
              }
            ]
          }
        ]
      },
      { class: 'form-group input-group',
        $$: [
          { $tag: 'span.input-group-addon', $text: 'Address' },
          { $tag: 'input#wallet_plain_address.form-control',
            name: 'plain_address',
            type: 'text',
            onchange(e){ this._address = e.target.value }
          },
          { class: 'input-group-btn',
            $$: [
              { $virus: buttonism('Add Address', 'info'),
                onclick() {
                  if (this._address) {
                    this._addresses.push({
                      type: 'address',
                      id: this._address
                    })
                  }
                }
              }
            ]
          }
        ]
      },
      { $tag: 'ul.list-group.hd-nodes.mt-3',
        _addAddress (address) {
          let self = this
          return {
            $virus: hamlism,
            $tag: 'li.list-group-item',
            $$: [
              { $tag: 'button.close',
                $text: '×',
                onclick(e){ self._addresses = _.without(self._addresses, address) }
              },
              { $tag: 'input.form-control.form-control-sm',
                value: address.id,
                readonly: true
              }
            ]
          }
        },
        $update() {
          this.innerHTML = ''
          _.each(this._addresses, (n) => this.$build(this._addAddress(n)))
        }
      }
    ]
  }
}
