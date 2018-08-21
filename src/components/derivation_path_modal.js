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
    _customDerivationPath: [],
    _network: 'Bitcoin',
    _displayCustomDerivationPath: false,
    _fromTrezor: true,
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
                    onchange (e) {
                      this._derivationPath = e.target.value
                      this._displayCustomDerivationPath = this._derivationPath === '[]'
                      if (this._derivationPath !== '[]') {
                        this._customDerivationPath = []
                      }
                    }
                  }, {
                    class: 'form-group input-group',
                    $update () {
                      if (this._displayCustomDerivationPath) {
                        this.classList.remove('invisible')
                        this.classList.add('visible')
                      } else {
                        this.classList.remove('visible')
                        this.classList.add('invisible')
                      }
                    },
                    $$: [
                      {
                        $tag: 'span.input-group-addon.col-sm-2',
                        $text: 'Custom Path'
                      },
                      {
                        $tag: 'input',
                        name: 'purpose-path',
                        id: 'purpose-path',
                        class: 'form-control col-sm-2',
                        type: 'number',
                        onchange (e) { this._customDerivationPath[0] = e.target.value }
                      },
                      {
                        $tag: 'input',
                        name: 'coin-type-path',
                        id: 'coin-type-path',
                        class: 'form-control col-sm-2',
                        type: 'number',
                        onchange (e) { this._customDerivationPath[1] = e.target.value }
                      },
                      {
                        $tag: 'input',
                        name: 'account-path',
                        id: 'account-path',
                        class: 'form-control col-sm-2',
                        type: 'number',
                        onchange (e) { this._customDerivationPath[2] = e.target.value }
                      },
                      {
                        $tag: 'input',
                        name: 'change-path',
                        id: 'change-path',
                        class: 'form-control col-sm-2',
                        type: 'number',
                        onchange (e) { this._customDerivationPath[3] = e.target.value }
                      },
                      {
                        $tag: 'input',
                        name: 'address-index-path',
                        id: 'address-index-path',
                        class: 'form-control col-sm-2',
                        type: 'number',
                        onchange (e) { this._customDerivationPath[4] = e.target.value }
                      }
                    ]
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
                        let path = ''
                        if (this._customDerivationPath.length === 0) {
                          path = this._derivationPath
                        } else {
                          path = JSON.stringify(this._customDerivationPath)
                        }

                        let modalRsk = document.querySelector('#modalDialogRsk')
                        if (this._fromTrezor) {
                          let address = await transaction._addAddressFromTrezor(this._network, path, coin)
                          modalRsk._fromRskAddress = address.toString()
                          modalRsk._rskAmount = address.balance
                        }
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
