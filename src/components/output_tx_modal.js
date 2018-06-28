import {buttonism, buttonism_with_size, select_object_groupism} from '../lib/bootstrapism.js'
import {update_epidemic} from '../lib/update_epidemic.js'

export function modalTx(createTx) {
  return {
    id: 'modalDialogTx',
    class: 'modal fade',
    role: 'dialog',
    _scriptType: '',
    _address: '',
    _amount: 0,
    $$: [
      {
        class: 'modal-dialog',
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
                    $text: 'Please add output parameters'
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
                  { $virus: select_object_groupism('Script Type', [
                    {id: '', text: 'Select a script type'},
                    {id: 'PAYTOADDRESS', text: 'PAYTOADDRESS'},
                    {id: 'PAYTOSCRIPTHASH', text: 'PAYTOSCRIPTHASH'}], 'script_type'),
                    name: 'script_type',
                    $update() {
                      this.value = this._scriptType
                    },
                    onchange(e) {
                      let self = this
                      this._scriptType = e.target.value
                    }
                  },
                  {
                    $tag: 'input',
                    name: 'address',
                    id: 'address',
                    class: 'form-control',
                    placeholder: 'Address',
                    type: 'text',
                    $update() {
                      this.value = this._address
                    },
                    onchange(e) {
                      this._address = e.target.value
                    }
                  },
                  {
                    $tag: 'input',
                    name: 'amount',
                    id: 'amount',
                    class: 'form-control',
                    placeholder: 'Amount',
                    type: 'number',
                    $update() {
                      this.value = this._amount
                    },
                    onchange(e) {
                      this._amount = e.target.value
                    }
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
                    $virus: buttonism_with_size('Send', 'primary', 'small'),
                    'data-dismiss': 'modal',
                    onclick() {
                      createTx.call(this, this._scriptType, this._address, this._amount)
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
