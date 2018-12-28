import { hamlism } from '../lib/hamlism';
import { updateEpidemic } from '../lib/update_epidemic';
import { buttonismWithSize } from '../lib/bootstrapism';
import { selectGroupism } from '../lib/bootstrapism'
import { Wallet, Address } from '../wallets_handler';
import { Transaction, Output } from '../lib/transaction';

export function clearWalletModal() {
  return {
    id: 'clearWalletModal',
    class: 'modal fade',
    role: 'dialog',
    _originWalletId: '',
    _originWalletType: '',
    _walletId: '',
    _publicAddress: '',
    _amount: 0,
    $virus: [updateEpidemic, hamlism],
    $update() {
      let wallet = (<any> window).wallets[0];
      if (wallet !== undefined) {
        this._walletId = wallet.id;
      }
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
                        onclick(_e: Event) { 
                          let self = this;
                          let wallet = (<any> window).wallets.find((wallet: Wallet) => wallet.id === this._walletId);

                          let domSelectObject = document.getElementById('chooseAddressModal');
                          let select = <HTMLSelectElement> domSelectObject;
                          select.innerHTML = "";
                          wallet.addresses.forEach((address: Address) => {
                            let opt = document.createElement('option');
                            opt.value = address.publicAddress;
                            opt.innerHTML = address.publicAddress;
                            select.appendChild(opt);
                          });
                          let selectedOption = select.options[select.selectedIndex];
                          if (selectedOption !== undefined) {
                            self._publicAddress = selectedOption.value;
                          }
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
                  },
                  {
                    class: 'form-group input-group',
                    $$: [
                      {
                        $tag: 'span.input-group-addon',
                        $text: 'Amount'
                      },
                      {
                        $tag: 'input.form-control',
                        name: 'chooseAmountModal',
                        id: 'chooseAmountModal',
                        onchange(e: Event) { this._amount = parseInt((<HTMLInputElement>e.target).value) }
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
                    $virus: buttonismWithSize('Clear', 'primary', 'small'),
                    'data-dismiss': 'modal',
                    'data-id': 'set-conf',
                    onclick () {
                      console.log(this._originWalletId);
                    }
                  },
                  {
                    $virus: buttonismWithSize('Create Transaction', 'success', 'small'),
                    'data-dismiss': 'modal',
                    'data-id': 'set-conf',
                    onclick () {
                      let self = this;
                      let transaction = new Transaction();
                      let output: Output = {
                        script_type: 'PAYTOADDRESS',
                        amount: self._amount,
                        address: self._publicAddress
                      };
                      let walletDetail = {
                        _walletType: this._originWalletType,
                        _walletId: this._originWalletId
                      };
                      transaction.createTx(walletDetail, this._networkName, [output]).then((tx) => {
                        (<any> document.querySelector('#signing'))._transactionJson = JSON.stringify(tx);
                        (<any> document.querySelector('#signing')).$update();
                      });
                      (<any> $('.nav-pills a[href="#tab_signing"]')).tab('show');
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
