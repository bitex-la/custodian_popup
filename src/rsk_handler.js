import _ from 'lodash'
import { Transaction } from './lib/transaction'
import { rskModal } from './components/rsk_modal.js'
import { updateEpidemic } from './lib/update_epidemic.js'
import { buttonism, buttonismWithSize, selectGroupism } from './lib/bootstrapism.js'
import { hamlism } from './lib/hamlism.js'
import { showError, loading, notLoading } from './messages.js'
import config from './config'

export function rskHandler () {
  return {
    id: 'rsk',
    $virus: [ updateEpidemic, hamlism ],
    class: 'form',
    _networkName: 'rsk',
    _rskAddresses: [],
    _fromRskAddress: '',
    async _addAddressFromTrezor () {
      let networkName = this._networkName
      loading()
      let _path = config._chooseDerivationPath(networkName)
      const address = await window.TrezorConnect.ethereumGetAddress({path: _path})
      if (address.success) {
        let transaction = new Transaction()
        let balance = await transaction.getRskBalance(address.payload.address.toLowerCase())
        notLoading()
        return new Promise(resolve => resolve({ toString: () => address.payload.address.toLowerCase(), balance }))
      } else {
        showError(address.payload.error)
      }
    },
    _addAddress () {
      this._addAddressFromTrezor().then(address => {
        this._rskAddresses.push(address)
        this.$update()
      })
    },
    _addRskAddress (address) {
      let self = this
      return {
        $virus: hamlism,
        $tag: 'li.list-group-item',
        $$: [
          { $tag: 'button.close',
            $text: '×',
            onclick (e) { self._rskAddresses = _.without(self._rskAddresses, address) }
          },
          {
            $tag: 'p span',
            $$: [
              {
                $tag: 'span',
                $text: address.toString()
              },
              {
                $tag: 'span', $text: ' '
              },
              {
                $tag: 'span',
                id: `balance-${address.toString()}`,
                $update () {
                  this.$text = `Balance: ${address.balance}`
                }
              },
              {
                $tag: 'row',
                $$: [
                  {
                    $virus: hamlism,
                    class: 'wallet-creation'
                  },
                  rskModal(self._networkName),
                  { $virus: buttonismWithSize('Send SBTC', 'success', 'small'),
                    'data-id': 'rsk-tx-creation',
                    'data-toggle': 'modal',
                    'data-target': '#modalDialogRsk',
                    onclick (e) {
                      let modalRsk = document.querySelector('#modalDialogRsk')
                      modalRsk._fromRskAddress = address.toString()
                      modalRsk._rskAmount = parseInt(address.balance)
                    }
                  },
                  {
                    $tag: 'span',
                    $text: ' '
                  },
                  { $virus: buttonismWithSize('Convert SBTC to BTC', 'success', 'small'),
                    'data-id': 'rsk-tx-creation',
                    'data-toggle': 'modal',
                    'data-target': '#modalDialogRsk',
                    onclick (e) {
                      let modalRsk = document.querySelector('#modalDialogRsk')
                      modalRsk._fromRskAddress = address.toString()
                      modalRsk._toRskAddress = '0x0000000000000000000000000000000001000006'
                      modalRsk._rskAmount = parseInt(address.balance)
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    },
    $$: [
      {
        $virus: selectGroupism('Network', ['rsk', 'rsk_testnet'], 'rsk'),
        name: 'network',
        id: 'setup_network',
        $update () { this.value = this._networkName },
        onchange (e) { this._networkName = e.target.value }
      },
      {
        $virus: buttonism('Add address from Trezor'),
        'data-id': 'add-rsk-address-from-trezor',
        onclick () { this._addAddress() }
      },
      { $tag: 'ul.list-group.rsk-addresses.mt-3',
        $update () {
          this.innerHTML = ''
          _.each(this._rskAddresses, (n) => this.$build(this._addRskAddress(n)))
        }
      }
    ]
  }
}
