import {updateEpidemic} from '../lib/update_epidemic.js'
import {buttonismWithSize} from '../lib/bootstrapism.js'
import {Transaction} from '../lib/transaction.js'

export function rskModal(networkName) {
  return {
    id: 'modalDialogRsk',
    class: 'modal fade',
    role: 'dialog',
    $virus: updateEpidemic,
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
                    $text: 'Send Smart Bitcoins'
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
                        $update() {
                          this.value = this._fromRskAddress
                        },
                        onchange(e) {
                          this._fromRskAddress = e.target.value
                        }
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
                        $update() {
                          this.value = this._toRskAddress
                        },
                        onchange(e) {
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
                        $update() {
                          this.value = this._rskAmount
                        },
                        onchange(e) {
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
                    $virus: buttonismWithSize('Create Transaction', 'primary', 'small'),
                    'data-dismiss': 'modal',
                    'data-id': 'create-rsk-tx',
                    onclick() {
                      switch(networkName) {
                        case 'rsk':
                          Transaction('rsk').signRskTransaction([44, 137, 0, 0], this._toRskAddress, this._fromRskAddress, null, null, this._rskAmount, null)
                          break
                        case 'rsk_testnet':
                          Transaction('rsk_testnet').signRskTransaction([44, 37310, 0, 0], this._toRskAddress, this._fromRskAddress, null, null, this._rskAmount, null)
                          break
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
