import { updateEpidemic } from './lib/update_epidemic';
import { buttonismWithSize, selectGroupism } from './lib/bootstrapism';
import { hamlism } from './lib/hamlism';
import { Transaction, Address } from './lib/transaction';
import config from './config';
import { WalletService } from './services/wallet_service';
import { TransactionService } from './services/transaction_service';
import { showError, showPermanentMessage } from './messages';

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
    _destinationRskAddress: '',
    _rskAmount: 0,
    _destinationBtcAddress: '',
    _btcAmount: 0,
    _rawTransaction: {},
    _updateBtcAddress (address: Address) {
      this._btcAddress = address;
    },
    _updateDestinationBtcAddress (address: string) {
      this._destinationBtcAddress = address;
    },
    _updateRskAddress (address: Address) {
      this._rskAddress = address;
    },
    _updateDestinationRskAddress (address: string) {
      this._destinationRskAddress = address;
    },
    _toHexString (byteArray: number[]) {
      return Array.prototype.map.call(byteArray, function (byte: number) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
      }).join('');
    },
    $$:[
      {
        $virus: selectGroupism('Network', ['Select Network...', 'Mainnet', 'Testnet']),
        name: 'network',
        id: 'setup_network',
        autofocus: true,
        $update () { this.value = this._networkName },
        onchange (e: Event) {
           this._networkName = (<HTMLInputElement> e.target).value;
           document.getElementById('get-address-button').classList.remove('invisible');
        }
      },
      {
        class: 'form-group invisible',
        id: 'get-address-button',
        $$: [
          {
            $virus: buttonismWithSize('Get Addresses', 'info', 'block'),
            'data-id': 'get-address-rsk',
            async onclick () {
              let transaction = new Transaction();
              let [coin, btcPath, rskPath] =
                this._networkName === 'Mainnet' ?
                 ['btc', config.defaultPath, config.rskMainNetPath] :
                 ['testnet', config.defaultTestnetPath, config.rskTestNetPath];
              this._updateBtcAddress(<Address> await transaction._addAddressFromTrezor('Bitcoin', btcPath, coin));
              this._updateRskAddress(<Address> await transaction._addAddressFromTrezor('Rsk', rskPath));
              document.getElementById('exchange-operations').classList.remove('invisible');
            }
          }
        ]
      },
      {
        class: 'row invisible',
        id: 'exchange-operations',
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
                        id: 'badge-btc-balance',
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
                            id: 'amount-btc',
                            placeholder: 'Amount',
                            onchange (e: Event) {
                              this._btcAmount = parseInt((<HTMLInputElement> e.target).value);
                            }
                          },
                          {
                            $type: 'input',
                            class: 'form-control form-group',
                            type: 'text',
                            placeholder: 'Destination',
                            id: 'destination-btc-address',
                            $update () { this.value = this._destinationBtcAddress },
                            onchange (e: Event) {
                              this._destinationBtcAddress = (<HTMLInputElement> e.target).value;
                            }
                          },
                          {
                            $type: 'input',
                            type: 'checkbox',
                            id: 'is-btc-peg',
                            async onchange (e: Event) {
                              if ((<HTMLInputElement> e.target).checked) {
                                let transaction = new Transaction();
                                let destinationBtcAddress = await transaction.getFederationAdress(this._networkName);
                                this._updateDestinationBtcAddress(destinationBtcAddress);
                                document.getElementById('destination-btc-address').setAttribute('disabled', 'disabled');
                              } else {
                                this._updateDestinationBtcAddress('');
                                document.getElementById('destination-btc-address').removeAttribute('disabled');
                              }
                            }
                          },
                          {
                            $type: 'label',
                            for: 'is-btc-peg',
                            $text: 'PEG'
                          },
                          {
                            $virus: buttonismWithSize('Send', 'primary', 'block'),
                            id: 'send-btc',
                            async onclick () {
                              let self = this
                              if (self._btcAddress.balance > self._btcAmount) {
                                this.disabled = true;
                                this.$text = 'Sending...';
                                let transaction = new Transaction();

                                try {
                                  let url = `/plain_wallets/relationships/addresses/${self._btcAddress.toString()}/get_utxos?since=0&limit=1000000`;
                                  let successData = await WalletService(config).list(url);
                                  this._rawTransaction = successData.data;
                                  this['_outputs'] = [{
                                    script_type: 'PAYTOADDRESS',
                                    address: self._destinationBtcAddress,
                                    amount: self._btcAmount
                                  }];

                                  let networkName = this._networkName === 'Mainnet' ? 'bitcoin' : 'testnet';
                                  let tx = await transaction.createTx(this, networkName);
                                  let signedTx = await transaction.signTransaction(tx, networkName);
                                  let transactionResponse = await TransactionService(config).broadcast(signedTx.rawtx);
                                  let decoded = self._toHexString(transactionResponse.hash);
                                  showPermanentMessage(`Transaction hash: ${decoded.toString('hex')}`);
                                } catch (e) {
                                  showError(e.json);
                                }
                                this.disabled = false;
                                this.$text = 'Send';
                              } else {
                                showError('The amount is less than allowed');
                                this.disabled = false;
                                this.$text = 'Send';
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
                        id: 'badge-rsk-balance',
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
                            id: 'amount-rsk',
                            placeholder: 'Amount',
                            onchange (e: Event) {
                              this._rskAmount = parseInt((<HTMLInputElement> e.target).value);
                            }
                          },
                          {
                            $type: 'input',
                            class: 'form-control form-group',
                            type: 'text',
                            placeholder: 'Destination',
                            id: 'destination-rsk-address',
                            $update () { this.value = this._destinationRskAddress },
                            onchange (e: Event) {
                              this._destinationRskAddress = (<HTMLInputElement> e.target).value;
                            }
                          },
                          {
                            $type: 'input',
                            type: 'checkbox',
                            id: 'is-rsk-peg',
                            async onchange (e: Event) {
                              if ((<HTMLInputElement> e.target).checked) {
                                this._updateDestinationRskAddress('0x0000000000000000000000000000000001000006');
                                document.getElementById('destination-rsk-address').setAttribute('disabled', 'disabled');
                              } else {
                                this._updateDestinationRskAddress('');
                                document.getElementById('destination-rsk-address').removeAttribute('disabled');
                              }
                            }
                          },
                          {
                            $type: 'label',
                            for: 'is-rsk-peg',
                            $text: 'PEG'
                          },
                          {
                            $virus: buttonismWithSize('Send', 'primary', 'block'),
                            id: 'send-rsk',
                            async onclick () {
                              if (this._rskAddress.balance > this._rskAmount) {
                                try {
                                  this.disabled = true;
                                  this.$text = 'Sending...';
                                  let transaction = new Transaction();
                                  let rskPath =
                                    this._networkName === 'Mainnet' ?
                                      config.rskMainNetPath : config.rskTestNetPath;
                                  let tx = await transaction.sendRskTransaction(this._networkName,
                                    rskPath,
                                    this._destinationRskAddress,
                                    this._rskAddress.toString(),
                                    null,
                                    this._rskAmount,
                                    null);
                                  showPermanentMessage(`Transaction hash: ${tx.transactionHash}`);
                                } catch (e) {
                                  showError(e);
                                }
                                this.disabled = false;
                                this.$text = 'Send';
                              } else {
                                showError('The amount is less than allowed');
                                this.disabled = false;
                                this.$text = 'Send';
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
          }
        ]
      }
    ]
  }
}
