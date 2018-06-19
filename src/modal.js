import {update_epidemic} from './lib/update_epidemic.js'

export function modal() {
  return {
    id: 'modalDialog',
    $virus: update_epidemic,
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
                    $tag: 'button.btn.btn-primary',
                    $text: 'Send',
                    'data-dismiss': 'modal',
                    id: 'okModalHandler'
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
