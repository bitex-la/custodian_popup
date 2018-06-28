import {buttonism, buttonism_with_size} from './lib/bootstrapism.js'
import {update_epidemic} from './lib/update_epidemic.js'

export function modal(addUtxos) {
  return {
    id: 'modalDialog',
    class: 'modal fade',
    role: 'dialog',
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
                    $text: 'Please add since and limit values'
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
                    $tag: 'input',
                    name: 'since',
                    id: 'since-tx',
                    class: 'form-control',
                    placeholder: 'since',
                    type: 'number'
                  },
                  {
                    $tag: 'input',
                    name: 'limit',
                    id: 'limit-tx',
                    class: 'form-control',
                    placeholder: 'limit',
                    type: 'number'
                  },
                  {
                    $tag: 'input',
                    name: 'wallet-id',
                    id: 'wallet-id',
                    class: 'form-control',
                    type: 'hidden'
                  },
                  {
                    $tag: 'input',
                    name: 'wallet-type',
                    id: 'wallet-type',
                    class: 'form-control',
                    type: 'hidden'
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
                      addUtxos.call(this, $('#wallet-type').val(), $('#wallet-id').val())
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
