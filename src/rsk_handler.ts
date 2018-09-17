import { updateEpidemic } from './lib/update_epidemic';
import { buttonismWithSize, selectGroupism } from './lib/bootstrapism';
import { hamlism } from './lib/hamlism';
import { Transaction } from './lib/transaction';
import config from './config';

export function rskHandler () {
  return {
    id: 'rsk',
    $virus: [ updateEpidemic, hamlism ],
    class: 'form',
    _networkName: 'Mainnet',
    _networkFromPath: 'Bitcoin',
    _fromRskAddress: '',
    _btcAddress: '',
    _rskAddress: '',
    $$: [
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
        async onclick() {
          let transaction = new Transaction();
          let [coin, btcPath, rskPath] =
            this._networkName === 'Mainnet' ?
             ['btc', config.defaultPath, config.rskMainNetPath] :
             ['testnet', config.defaultTestnetPath, config.rskTestNetPath];
          this._btcAddress = await transaction._addAddressFromTrezor('Bitcoin', btcPath, coin);
          this._rskAddress = await transaction._addAddressFromTrezor('Rsk', rskPath);
        }
      },
      {
        $tag: 'label',
        $update () { this.$text = this._btcAddress }
      },
      {
        $tag: 'label',
        $update () { this.$text = this._rskAddress }
      }
      ]
  }
}
