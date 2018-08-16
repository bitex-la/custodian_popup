import $ from 'jquery'
import { hamlism } from '../lib/hamlism.js'
import { updateEpidemic } from '../lib/update_epidemic.js'
import { selectObjectGroupism, buttonismWithSize } from '../lib/bootstrapism.js'
import { Transaction } from '../lib/transaction'
import config from '../config'
import { showError } from '../messages.js'

export function DerivationPathModal () {
  return {
    id: 'modalDerivation',
    class: 'modalDerivation modal fade',
    role: 'dialog',
    $virus: [updateEpidemic, hamlism],
    _derivationPath: '[44, 0, 0, 0, 0]',
    _network: 'Bitcoin',
    $$: [
      {
        class: 'modal-dialog modal-lg',
        role: 'document',
        $$: [
          {
            class: 'modal-content',
            $$: [
              {
                class: 'modal-header',
                $$: [
                  {
                    $tag: 'h5',
                    class: 'modal-title',
                    $text: 'Set Derivation Path'
                  },
                  {
                    $tag: 'button.close',
                    'aria-label': 'Close',
                    $$: [
                      {
                        $tag: 'span',
                        'aria-hidden': true,
                        $text: 'x'
                      }
                    ],
                    onclick () { $('#modalDerivation').modal('hide') }
                  }
                ]
              },
              {
                class: 'modal-body',
                $$: [
                  {
                    $virus: selectObjectGroupism('Derivation Path', config._derivationPaths()),
                    name: 'Derivation Path',
                    id: 'derivation_path',
                    $update () { this.value = this._derivationPath },
                    onchange (e) { this._derivationPath = e.target.value }
                  }
                ]
              },
              {
                class: 'modal-footer',
                $$: [
                  {
                    $tag: 'button.btn.btn-secondary',
                    $text: 'Close',
                    onclick () { $('#modalDerivation').modal('hide') }
                  },
                  {
                    $virus: buttonismWithSize('Submit', 'primary', 'small'),
                    'data-id': 'create-rsk-tx',
                    async onclick () {
                      try {
                        let transaction = new Transaction()
                        let rsk = document.querySelector('#rsk')
                        let coin = rsk._networkName === 'Mainnet' ? 'btc' : 'testnet'
                        let address = await transaction._addAddressFromTrezor(this._network, this._derivationPath, coin)
                        let modalRsk = document.querySelector('#modalDialogRsk')
                        modalRsk._fromRskAddress = address.toString()
                        modalRsk._rskAmount = address.balance
                        modalRsk._path = this._derivationPath
                        modalRsk.$update()
                        $('#modalDerivation').modal('hide')
                      } catch (e) {
                        showError(e)
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
