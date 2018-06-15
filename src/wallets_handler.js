import {hamlism} from './lib/hamlism.js'
import {update_epidemic} from './lib/update_epidemic.js'
import {select_object_groupism, select_groupism, form_groupism, buttonism} from './lib/bootstrapism.js'

import {walletService} from './services/wallet_service.js'

export function walletHandler() {
  return {
    id: 'wallet',
    $virus: update_epidemic,
    class: 'form',
    _wallet_type: '',
    _address: '',
    _addresses: [],
    _wallet: {},
    _build_wallet () {
      return {
        data: {
          attributes: { version: this._addresses.length },
          type: this._wallet_type,
          relationships: {
            addresses: {
              data: this._addresses
            }
          }
        }
      }
    },
    $$: [
      { $virus: select_object_groupism('Wallet Type', [{id: 'plain_wallet', text: 'Plain'},
                                                       {id: 'hd_wallet', text: 'Hd'},
                                                       {id: 'multisig_wallet', text: 'Multisig'}], 'plain_wallet'),
        name: 'wallet_type',
        onchange(e) { this._wallet_type = e.target.value }
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
      { $virus: buttonism('Create Wallet', 'success'),
        onclick() {
          walletService().create('/plain_wallets', this._build_wallet(), (success_data) => { console.log(success_data) }, (error_data) => { console.log(error_data) })
        }
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
