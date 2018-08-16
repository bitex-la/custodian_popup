import { hamlism } from '../lib/hamlism.js'
import { Transaction } from '../lib/transaction'
import { updateEpidemic } from '../lib/update_epidemic.js'
import { buttonism, buttonismWithSize } from '../lib/bootstrapism.js'
import { showError, showSuccess } from '../messages.js'
import { DerivationPathModal } from './derivation_path_modal.js'

export function rskModal () {
  return {
    id: 'modalDialogRsk',
    class: 'modal fade',
    role: 'dialog',
    $virus: [updateEpidemic, hamlism],
    _title: 'Send Smart Bitcoins',
    _rskAmount: 0,
    _fromRskAddress: '',
    _toRskAddress: '',
    _networkName: '',
    _path: '',
    _disableToAddress: false,
    _network: 'Bitcoin',
    _clear () {
      this._rskAmount = 0
      this._fromRskAddress = ''
      this._toRskAddress = ''
    },
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
                    $text: 'Send Smart Bitcoins',
                    $update () {
                      this.$text = this._title
                    }
                  },
                  {
                    $tag: 'button.close',
                    'data-dismiss': 'modal',
                    'aria-label': 'Close',
                    $$: [
                      {
                        $tag: 'span',
                        'aria-hidden': true,
                        $text: 'x'
                      }
                    ]
                  }
                ]
              },
              {
                class: 'modal-body',
                $$: [
                  {
                    class: 'form-group input-group',
                    $$: [
                      {
                        $tag: 'span.input-group-addon',
                        $text: 'Address (From)'
                      },
                      {
                        $tag: 'input',
                        name: 'from',
                        id: 'from-address-rsk',
                        class: 'form-control',
                        type: 'text',
                        $update () {
                          this.value = this._fromRskAddress
                        },
                        onchange (e) {
                          this._fromRskAddress = e.target.value
                        }
                      },
                      {
                        class: 'input-group-btn add-node-group',
                        $$: [
                          DerivationPathModal(),
                          {
                            $virus: buttonism('Add address from Trezor'),
                            'data-toggle': 'modal',
                            'data-target': '#modalDerivation',
                            'data-id': 'add-address-from-trezor',
                            onclick () {
                              let derivationPathModal = document.querySelector('#modalDerivation')
                              derivationPathModal._network = this._network
                            }
                          }
                        ]
                      }
                    ]
                  },
                  {
                    class: 'form-group input-group',
                    $$: [
                      {
                        $tag: 'span.input-group-addon',
                        $text: 'Address (To)'
                      },
                      {
                        $tag: 'input',
                        name: 'to',
                        id: 'to-address-rsk',
                        class: 'form-control',
                        type: 'text',
                        $update () {
                          this.value = this._toRskAddress
                          if (this._disableToAddress) {
                            this.disabled = this._disableToAddress
                          } else {
                            this.removeAttribute('disabled')
                          }
                        },
                        onchange (e) {
                          this._toRskAddress = e.target.value
                        }
                      }
                    ]
                  },
                  {
                    class: 'form-group input-group',
                    $$: [
                      {
                        $tag: 'span.input-group-addon',
                        $text: 'Amount'
                      },
                      {
                        $tag: 'input',
                        name: 'amount',
                        id: 'amount-rsk',
                        class: 'form-control',
                        type: 'number',
                        $update () {
                          this.value = this._rskAmount
                        },
                        onchange (e) {
                          this._rskAmount = e.target.value
                        }
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
                    'data-dismiss': 'modal',
                    $text: 'Close'
                  },
                  {
                    $virus: buttonismWithSize('Submit', 'primary', 'small'),
                    'data-dismiss': 'modal',
                    'data-id': 'create-rsk-modal-tx',
                    onclick () {
                      let self = this
                      let transaction = new Transaction()
                      try {
                        switch (self._network) {
                          case 'Bitcoin':
                            transaction.sendBtcTransaction(self._networkName, JSON.parse(self._path), self._toRskAddress, self._fromRskAddress, parseInt(self._rskAmount))
                            break
                          case 'Rsk':
                            transaction.sendRskTransaction(self._networkName, JSON.parse(self._path), self._toRskAddress, self._fromRskAddress, null, parseInt(self._rskAmount), null)
                            break
                        }
                        showSuccess('Transaction broadcasted')
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
