import { updateEpidemic } from './lib/update_epidemic';
import { buttonismWithSize, selectGroupism } from './lib/bootstrapism';
import { hamlism } from './lib/hamlism';
import { Transaction, Address } from './lib/transaction';
import config from './config';
import { WalletService } from './services/wallet_service.js';
import { TransactionService } from './services/transaction_service.js'
import { showSuccess, showError } from './messages';

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
    _destinationAddress: '',
    _amount: 0,
    _rawTransaction: {},
    async _getDestinationAddress(): Promise<string> {
      let transaction = new Transaction();
      switch(this._destinationAddress) {
        case 'PEG': 
          return transaction.getFederationAdress(this._networkName);
        default: 
          return this._destinationAddress;
      }
    },
    _updateBtcAddress (address: Address) {
      this._btcAddress = address;
    },
    _updateRskAddress (address: Address) {
      this._rskAddress = address;
    },
    $$:[
      {
        $type: 'datalist',
        id: 'peg',
        $$: [
          {
            $type: 'option',
            value: 'PEG'
          }
        ]
      },
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
                            placeholder: 'Amount',
                            onchange (e: Event) {
                              this._amount = parseInt((<HTMLInputElement> e.target).value);
                            }
                          },
                          {
                            $type: 'input',
                            class: 'form-control form-group',
                            type: 'text',
                            list: 'peg',
                            placeholder: 'Destination',
                            onchange (e: Event) {
                              this._destinationAddress = (<HTMLInputElement> e.target).value;
                            }
                          },
                          {
                            $virus: buttonismWithSize('Send', 'primary', 'block'),
                            'data-id': 'send-btc',
                            async onclick () {
                              let self = this
                              if (self._btcAddress.balance > self._amount) {
                                let transaction = new Transaction();

                                let url = `/plain_wallets/relationships/addresses/${Object.keys(self._btcAddress.toString())[0]}/get_utxos?since=0&limit=1000000`;
                                let successData: { data: { }} = await WalletService(config).list(url);
                                this._rawTransaction = successData.data;
                                this._rawTransaction['_outputs'] = [{
                                  script_type: 'PAYTOADDRESS',
                                  address: self._getDestinationAddress(),
                                  amount: self._amount
                                }];

                                let networkName = this._networkName === 'Mainnet' ? 'bitcoin' : 'testnet';
                                let tx = await transaction.createTx(this._rawTransaction, networkName);
                                let signedTx = await transaction.signTransaction(tx, networkName);
                                TransactionService(config).broadcast(signedTx);
                                showSuccess('Transaction Broadcasted');
                              } else {
                                showError('The amount is less than allowed');
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
                            list: 'peg',
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
