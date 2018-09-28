import { hamlism } from '../lib/hamlism';
import { updateEpidemic } from '../lib/update_epidemic';
import { buttonismWithSize } from '../lib/bootstrapism';
import config from '../config';

export function confModal () {
  return {
    id: 'confModal',
    class: 'modal fade',
    role: 'dialog',
    $virus: [updateEpidemic, hamlism],
    _title: 'Configuration',
    _rskTestnetUrl: '',
    _rskMainnetUrl: '',
    $init() {
      this._rskTestnetUrl = config._getRskTestnetNodeUrl();
      this._rskMainnetUrl = config._getRskMainnetNodeUrl();
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
                    $text: 'Configuration',
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
                        $text: 'Rsk Testnet Url'
                      },
                      {
                        $tag: 'input',
                        name: 'from',
                        id: 'url-conf-rsk-testnet',
                        class: 'form-control',
                        type: 'text',
                        $update () { this.value = this._rskTestnetUrl; },
                        onchange (e: Event) {
                          this._rskTestnetUrl = (<HTMLInputElement> e.target).value;
                        }
                      }
                    ]
                  },
                  {
                    class: 'form-group input-group',
                    $$: [
                      {
                        $tag: 'span.input-group-addon',
                        $text: 'Rsk Mainnet Url'
                      },
                      {
                        $tag: 'input',
                        name: 'from',
                        id: 'url-conf-rsk-mainnet',
                        class: 'form-control',
                        type: 'text',
                        $update () { this.value = this._rskMainnetUrl; },
                        onchange (e: Event) {
                          this._rskMainnetUrl = (<HTMLInputElement> e.target).value;
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
                    'data-id': 'set-conf',
                    onclick () {
                      if (this._rskTestnetUrl.length > 0) {
                        config._setRskTestnetNodeUrl(this._rskTestnetUrl);
                      }
                      if (this._rskMainnetUrl.length > 0) {
                        config._setRskMainnetNodeUrl(this._rskMainnetUrl);
                      }

                      (<any> $('#confModal')).modal('hide');
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
