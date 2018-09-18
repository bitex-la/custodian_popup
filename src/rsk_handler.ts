import { updateEpidemic } from './lib/update_epidemic';
import { buttonismWithSize, selectGroupism } from './lib/bootstrapism';
import { hamlism } from './lib/hamlism';
import { Transaction, Address } from './lib/transaction';
import config from './config';
import Cell from './types/cell';

class RskHandler extends Cell {
  id: string;
  virus: any[];
  class: string;
  _networkName: string;
  _networkFromPath: string;
  _fromRskAddress: string;
  _btcAddress: string;
  _rskAddress: string;
  $$: any[];

  updateBtcAddress (address: Address) {
    this._btcAddress = address.toString();
  }

  updateRskAddress (address: Address) {
    this._rskAddress = address.toString();
  }

  $update () {
    console.log('okkkk');
  }

  constructor () {
    super();
    let self = this;
    this.id = 'rsk';
    this.virus = [ updateEpidemic, hamlism ];
    this.class = 'form';
    this._networkName = 'Mainnet';
    this._networkFromPath = 'Bitcoin';
    this._fromRskAddress = '';
    this.$update = () => {
      console.log('upppdatee');
    };
    this.$$ = [
      {
        $virus: selectGroupism('Network', ['Mainnet', 'Testnet']),
        name: 'network',
        id: 'setup_network',
        $update () { this.value = this._networkName },
        onchange (e: Event) { this._networkName = (<HTMLInputElement> e.target).value }
      },
      {
        $virus: buttonismWithSize('Get Address', 'info', 'block'),
        'data-id': 'get-address-rsk',
        async onclick () {
          let transaction = new Transaction();
          let [coin, btcPath, rskPath] =
            this._networkName === 'Mainnet' ?
             ['btc', config.defaultPath, config.rskMainNetPath] :
             ['testnet', config.defaultTestnetPath, config.rskTestNetPath];
          self.updateBtcAddress(<Address> await transaction._addAddressFromTrezor('Bitcoin', btcPath, coin));
          self.updateRskAddress(<Address> await transaction._addAddressFromTrezor('Rsk', rskPath));
        }
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
                    class: 'card-body',
                    $$: [
                      {
                        $type: 'input',
                        type: 'text',
                        readonly: true,
                        value: '',
                        $update () { this.value = self._btcAddress }
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
                    class: 'card-body',
                    $$: [
                      {
                        $type: 'input',
                        type: 'text',
                        readonly: true,
                        value: '',
                        $update () { this.value = self._rskAddress }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }
}


export function rskHandler (): RskHandler {
  return new RskHandler();
}
