import { hamlism } from '../lib/hamlism';
import { updateEpidemic } from '../lib/update_epidemic';
import { buttonismWithSize } from '../lib/bootstrapism';
import { selectGroupism } from '../lib/bootstrapism'
import config from '../config';
import { Wallet, Address } from '../wallets_handler';
import { JsonApiAddress } from '../services/address_service';

export function clearWalletModal() {
  let wallet: Wallet = null;
  return {
    id: 'clearWalletModal',
    class: 'modal fade',
    role: 'dialog',
    _walletId: '',
    _publicAddress: '',
    $virus: [updateEpidemic, hamlism],
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
                    $text: 'Clear Wallet'
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
                        $virus: selectGroupism('Choose Wallet', []),
                        name: 'chooseWalletModal',
                        id: 'chooseWalletModal',
                        onchange(e: Event) { this._walletId = (<HTMLInputElement>e.target).value },
                        onclick(e: Event) { 
                          let wallet = (<any> window).wallets.find((wallet: Wallet) => wallet.id === this._walletId);

                          let select = document.getElementById('chooseAddressModal');
                          select.innerHTML = "";
                          wallet.addresses.forEach((address: JsonApiAddress) => {
                            let opt = document.createElement('option');
                            opt.value = address.data.public_address;
                            opt.innerHTML = address.data.public_address;
                            select.appendChild(opt);
                          });
                        }
                      }
                    ]
                  },
                  {
                    class: 'form-group input-group',
                    $$: [
                      {
                        $virus: selectGroupism('Choose Address', []),
                        name: 'chooseAddressModal',
                        id: 'chooseAddressModal',
                        onchange(e: Event) { this._publicAddress = (<HTMLInputElement>e.target).value }
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
                    'data-id': 'set-conf',
                    onclick () {
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
