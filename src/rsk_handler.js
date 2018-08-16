import _ from 'lodash'
import { Transaction } from './lib/transaction'
import { rskModal } from './components/rsk_modal.js'
import { updateEpidemic } from './lib/update_epidemic.js'
import { buttonism, buttonismWithSize, selectGroupism, selectObjectGroupism } from './lib/bootstrapism.js'
import { hamlism } from './lib/hamlism.js'
import { showError, loading, notLoading } from './messages.js'
import config from './config'

export function rskHandler () {
  return {
    id: 'rsk',
    $virus: [ updateEpidemic, hamlism ],
    class: 'form',
    _networkName: 'rsk',
    _networkFromPath: 'Bitcoin',
    _rskAddresses: [],
    _fromRskAddress: '',
    _derivationPath: '[44, 0, 0, 0, 0]',
    async _addRskAddressFromTrezor () {
      loading()
      const address = await window.TrezorConnect.ethereumGetAddress({path: JSON.parse(this._derivationPath)})
      if (address.success) {
        let transaction = new Transaction()
        let balance = await transaction.getRskBalance(address.payload.address.toLowerCase())
        notLoading()
        return new Promise(resolve => resolve({ toString: () => address.payload.address.toLowerCase(), balance, type: 'rsk' }))
      } else {
        showError(address.payload.error)
      }
    },
    async _addBtcAddressFromTrezor () {
      loading()
      const address = await window.TrezorConnect.getAddress({path: JSON.parse(this._derivationPath), coin: this._networkFromPath})
      if (address.success) {
        let transaction = new Transaction()
        let balance = await transaction.getBalance('bitcoin', address.payload.address)
        notLoading()
        return new Promise(resolve => resolve({ toString: () => address.payload.address, balance, type: 'btc' }))
      } else {
        showError(address.payload.error)
      }
    },
    _addRskAddress () {
      this._addRskAddressFromTrezor().then(address => {
        this._rskAddresses.push(address)
        this.$update()
      })
    },
    _addBtcAddress () {
      this._addBtcAddressFromTrezor().then(address => {
        this._rskAddresses.push(address)
        this.$update()
      })
    },
    _addActionButtons (address) {
      let self = this
      if (address.type === 'rsk') {
        return [{
          $virus: buttonismWithSize('Send SBTC', 'success', 'small'),
          'data-id': 'rsk-tx-creation',
          'data-toggle': 'modal',
          'data-target': '#modalDialogRsk',
          onclick (e) {
            let modalRsk = document.querySelector('#modalDialogRsk')
            modalRsk._fromRskAddress = address.toString()
            modalRsk._rskAmount = parseInt(address.balance)
          }
        }, {
          $tag: 'span',
          $text: ' '
        }, {
          $virus: buttonismWithSize('Convert SBTC to BTC', 'success', 'small'),
          'data-id': 'rsk-tx-creation',
          'data-toggle': 'modal',
          'data-target': '#modalDialogRsk',
          onclick (e) {
            let modalRsk = document.querySelector('#modalDialogRsk')
            modalRsk._fromRskAddress = address.toString()
            modalRsk._toRskAddress = '0x0000000000000000000000000000000001000006'
            modalRsk._rskAmount = parseInt(address.balance)
          }
        }]
      } else if (address.type === 'btc') {
        return [{
          $virus: buttonismWithSize('Convert BTC to SBTC', 'success', 'small'),
          'data-id': 'btc-tx-creation',
          'data-toggle': 'modal',
          'data-target': '#modalDialogRsk',
          async onclick (e) {
            let fedAddress
            try {
              let transaction = new Transaction()
              fedAddress = await transaction.getFederationAdress(self._networkName)
            } catch (error) {
              showError(error)
            }

            let modalRsk = document.querySelector('#modalDialogRsk')
            modalRsk._fromRskAddress = address.toString()
            modalRsk._rskAmount = parseInt(address.balance)
            modalRsk._title = 'Convert BTC to SBTC'
            modalRsk._toRskAddress = fedAddress
            modalRsk.$update()
          }
        }]
      } else {
        return []
      }
    },
    _addRskAddressToList (address) {
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
                  rskModal(self._networkName, self._derivationPath)
                ].concat(self._addActionButtons(address))
              }
            ]
          }
        ]
      }
    },
    $$: [
      {
        $virus: selectGroupism('Network', ['bitcoin', 'testnet', 'rsk', 'rsk_testnet'], 'rsk'),
        name: 'network',
        id: 'setup_network',
        $update () { this.value = this._networkName },
        onchange (e) { this._networkName = e.target.value }
      },
      {
        $virus: selectObjectGroupism('Derivation Path', config._derivationPaths()),
        name: 'Derivation Path',
        id: 'derivation_path',
        $update () { this.value = this._derivationPath },
        onchange (e) {
          this._networkFromPath = this.options[this.selectedIndex].text
          this._derivationPath = e.target.value
        }
      },
      {
        $virus: buttonism('Add Rsk address from Trezor'),
        'data-id': 'add-rsk-address-from-trezor',
        onclick () { this._addRskAddress() }
      },
      {
        $virus: buttonism('Add BTC address from Trezor'),
        'data-id': 'add-btc-address-from-trezor',
        onclick () { this._addBtcAddress() }
      },
      { $tag: 'ul.list-group.rsk-addresses.mt-3',
        $update () {
          this.innerHTML = ''
          _.each(this._rskAddresses, (n) => this.$build(this._addRskAddressToList(n)))
        }
      }
    ]
  }
}
