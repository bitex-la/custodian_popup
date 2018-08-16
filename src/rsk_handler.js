import { Transaction } from './lib/transaction'
import { rskModal } from './components/rsk_modal.js'
import { updateEpidemic } from './lib/update_epidemic.js'
import { buttonismWithSize, selectGroupism } from './lib/bootstrapism.js'
import { hamlism } from './lib/hamlism.js'
import { showError } from './messages.js'

export function rskHandler () {
  return {
    id: 'rsk',
    $virus: [ updateEpidemic, hamlism ],
    class: 'form',
    _networkName: 'Mainnet',
    _networkFromPath: 'Bitcoin',
    _rskAddresses: [],
    _fromRskAddress: '',
    $$: [
      rskModal(),
      {
        $virus: selectGroupism('Network', ['Mainnet', 'Testnet'], 'Mainnet'),
        name: 'network',
        id: 'setup_network',
        $update () { this.value = this._networkName },
        onchange (e) { this._networkName = e.target.value }
      },
      {
        $virus: buttonismWithSize('Convert SBTC to BTC', 'success', 'small'),
        'data-id': 'rsk-tx-creation',
        'data-toggle': 'modal',
        'data-target': '#modalDialogRsk',
        onclick (e) {
          let modalRsk = document.querySelector('#modalDialogRsk')
          modalRsk._clear()
          modalRsk._network = 'Rsk'
          modalRsk._title = 'Convert SBTC to BTC'
          modalRsk._toRskAddress = '0x0000000000000000000000000000000001000006'
          modalRsk._disableToAddress = true
          modalRsk._networkName = this._networkName
        }
      }, {
        $tag: 'span',
        $text: ' '
      }, {
        $virus: buttonismWithSize('Send SBTC', 'success', 'small'),
        'data-id': 'rsk-tx-creation',
        'data-toggle': 'modal',
        'data-target': '#modalDialogRsk',
        onclick (e) {
          let modalRsk = document.querySelector('#modalDialogRsk')
          modalRsk._clear()
          modalRsk._title = 'Send SBTC'
          modalRsk._network = 'Rsk'
          modalRsk._disableToAddress = false
          modalRsk._networkName = this._networkName
        }
      }, {
        $tag: 'span',
        $text: ' '
      }, {
        $virus: buttonismWithSize('Convert BTC to SBTC', 'success', 'small'),
        'data-id': 'btc-tx-creation',
        'data-toggle': 'modal',
        'data-target': '#modalDialogRsk',
        async onclick (e) {
          let fedAddress
          let self = this
          try {
            let transaction = new Transaction()
            fedAddress = await transaction.getFederationAdress(self._networkName)
          } catch (error) {
            showError(error)
          }

          let modalRsk = document.querySelector('#modalDialogRsk')
          modalRsk._clear()
          modalRsk._title = 'Convert BTC to SBTC'
          modalRsk._toRskAddress = fedAddress
          modalRsk._disableToAddress = true
          modalRsk._network = 'Bitcoin'
          modalRsk._networkName = this._networkName
          modalRsk.$update()
        }
      }]
  }
}
