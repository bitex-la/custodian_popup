import {hamlism} from './lib/hamlism.js'
import {update_epidemic} from './lib/update_epidemic.js'
import {select_groupism, form_groupism, buttonism} from './lib/bootstrapism.js'

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
    $$: [
      { $virus: select_groupism('Wallet Type', ['plain', 'hd', 'multisig'], 'plain'),
        name: 'wallet_type',
        $update() { this.value = this._wallet_type },
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
                    this._addresses.push(this._address)
                  }
                }
              }
            ]
          }
        ]
      },
      { $virus: buttonism('Create Wallet', 'success'),
        onclick() {
          walletService().addWallet('/plain_wallets', this._wallet, (success_data) => { console.log(success_data) }, (error_data) => { console.log(error_data) })
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
                value: address,
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
