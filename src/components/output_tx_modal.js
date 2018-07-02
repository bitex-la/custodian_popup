import {hamlism} from '../lib/hamlism.js'
import {buttonism, buttonismWithSize, selectObjectGroupism} from '../lib/bootstrapism.js'
import {updateEpidemic} from '../lib/update_epidemic.js'

export function modalTx(amountFn, addOutputs, createTx) {
  return {
    id: 'modalDialogTx',
    class: 'modal fade',
    role: 'dialog',
    $virus: updateEpidemic,
    _scriptType: '',
    _address: '',
    _amount: 0,
    _updateAmount() {
      this._amount = amountFn(this) - _.sum(_.map(this._transaction.outputs, (tx) => parseFloat(tx.amount)))
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
                  { $virus: selectObjectGroupism('Script Type', [
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
                  },
                  {
                    $tag: 'table.table',
                    $$: [{
                      $tag: 'thead',
                      $$: [{
                        $tag: 'tr',
                        $$: [{
                          $tag: 'th',
                          $text: 'Script Type'
                        }, {
                          $tag: 'th',
                          $text: 'Address'
                        }, {
                          $tag: 'th',
                          $text: 'Amount'
                        }, {
                          $tag: 'th',
                          $text: ''
                        }]
                      }]
                    }, {
                      $tag: 'tbody',
                      _fillOutputs(output) {
                        let self = this
                        return {
                          $tag: 'tr',
                          $virus: hamlism,
                          $$: [{
                            $tag: 'td',
                            $text: output.script_type
                          }, {
                            $tag: 'td',
                            $text: output.address
                          }, {
                            $tag: 'td',
                            $text: output.amount
                          }, {
                            $tag: 'button.close',
                            'aria-label': 'Close',
                            $$: [
                              {
                                $tag: 'span',
                                'aria-hidden': true,
                                $text: 'x'
                              }
                            ],
                            onclick() {
                              _.remove(self._transaction.outputs, (_output) => { return  _output == output })
                              self._updateAmount()
                            }
                          }]
                        }
                      },
                      $update() {
                        this.innerHTML = ''
                        _.each(this._transaction.outputs, (output) => this.$build(this._fillOutputs(output)))
                      }
                    }]
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
                    $tag: 'button.btn.btn-success',
                    $text: 'Add',
                    onclick() {
                      addOutputs(this, this._scriptType, this._address, this._amount)
                      this._updateAmount()
                    }
                  },
                  {
                    $virus: buttonismWithSize('Create', 'primary', 'small'),
                    'data-dismiss': 'modal',
                    onclick() {
                      createTx(this)
                      $('.nav-pills a[href="#tab_signing"]').tab('show')
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
