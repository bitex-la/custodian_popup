import { updateEpidemic } from './lib/update_epidemic';
import { buttonismWithSize, selectGroupism } from './lib/bootstrapism';
import { hamlism } from './lib/hamlism';
import { Transaction, Address } from './lib/transaction';
import config from './config';
import Cell from './types/cell';

export function rskHandler () {
  let btcAddress: Address = { balance: '0', toString: (): string => '', type: '' };
  let rskAddress: Address = { balance: '0', toString: (): string => '', type: '' };
  return {
    id: 'rsk',
    $virus: [ updateEpidemic, hamlism ],
    class: 'form',
    _networkName: 'Mainnet',
    _networkFromPath: 'Bitcoin',
    _fromRskAddress: '',
    _btcAddress: btcAddress,
    _rskAddress: rskAddress,
    _updateBtcAddress (address: Address) {
      this._btcAddress = address;
    },
    _updateRskAddress (address: Address) {
      this._rskAddress = address;
    },
    $$:[
      {
        $virus: selectGroupism('Network', ['Mainnet', 'Testnet']),
        name: 'network',
        id: 'setup_network',
        autofocus: true,
        $update () { this.value = this._networkName },
        onchange (e: Event) { this._networkName = (<HTMLInputElement> e.target).value }
      },
      {
        class: 'form-group',
        $$: [
          {
            $virus: buttonismWithSize('Get Address', 'info', 'block'),
            'data-id': 'get-address-rsk',
            async onclick () {
              let transaction = new Transaction();
              let [coin, btcPath, rskPath] =
                this._networkName === 'Mainnet' ?
                 ['btc', config.defaultPath, config.rskMainNetPath] :
                 ['testnet', config.defaultTestnetPath, config.rskTestNetPath];
              this._updateBtcAddress(<Address> await transaction._addAddressFromTrezor('Bitcoin', btcPath, coin));
              this._updateRskAddress(<Address> await transaction._addAddressFromTrezor('Rsk', rskPath));
            }
          }
        ]
      },
      {
        class: 'row',
        $$: [
          {
            class: 'col-lg-6',
            $$: [
              {
                class: 'card',
                $$: [
                  {
                    class: 'card-header text-center',
                    $text: 'BTC'
                  },
                  {
                    class: 'card-body',
                    $$: [
                      {
                        $type: 'span',
                        class: 'badge badge-info',
                        $update () { this.$text = this._btcAddress.balance }
                      },
                      {
                        $type: 'input',
                        class: 'form-control',
                        type: 'text',
                        readonly: true,
                        $update () { this.value = this._btcAddress.toString() }
                      },
                      {
                        $type: 'hr'
                      },
                      {
                        class: 'form-group',
                        $$: [
                          {
                            $type: 'input',
                            class: 'form-control form-group',
                            type: 'text',
                            placeholder: 'Amount'
                          },
                          {
                            $type: 'input',
                            class: 'form-control form-group',
                            type: 'text',
                            placeholder: 'Destination'
                          },
                          {
                            $virus: buttonismWithSize('Send', 'primary', 'block'),
                            'data-id': 'send-btc',
                            async onclick () {
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            class: 'col-lg-6',
            $$: [
              {
                class: 'card',
                $$: [
                  {
                    class: 'card-header text-center',
                    $text: 'RBTC'
                  },
                  {
                    class: 'card-body',
                    $$: [
                      {
                        $type: 'span',
                        class: 'badge badge-info',
                        $update () { this.$text = this._rskAddress.balance }
                      },
                      {
                        $type: 'input',
                        class: 'form-control',
                        type: 'text',
                        readonly: true,
                        $update () { this.value = this._rskAddress.toString() }
                      },
                      {
                        $type: 'hr'
                      },
                      {
                        class: 'form-group',
                        $$: [
                          {
                            $type: 'input',
                            class: 'form-control form-group',
                            type: 'text',
                            placeholder: 'Amount'
                          },
                          {
                            $type: 'input',
                            class: 'form-control form-group',
                            type: 'text',
                            placeholder: 'Destination'
                          },
                          {
                            $virus: buttonismWithSize('Send', 'primary', 'block'),
                            'data-id': 'send-rsk',
                            async onclick () {
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
        ]
      }
    ]
  }
}
