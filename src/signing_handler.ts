import { Transaction } from './lib/transaction'
import * as bitcoin from 'bitcoinjs-lib'
import { showError, showSuccess } from './messages'
import { selectGroupism } from './lib/bootstrapism'
import { updateEpidemic } from './lib/update_epidemic'
import { TransactionService } from './services/transaction_service'
import * as networks from './lib/networks.js'
import config from './config'

(<any> window).bitcoin = bitcoin

export function signingHandler () {
  return {
    id: 'signing',
    $virus: updateEpidemic,
    _transactionJson: '',
    class: 'form',
    _rawtx: '',
    _rskAddress: '',
    $update () {
      let self = this
      if (self._rawtx) {
        self.$build({
          class: 'jumbotron serialized-hex-tx',
          $type: 'textarea',
          cols: 100,
          $text: this._rawtx
        })
        self.$build({
          $type: 'button',
          class: 'button btn btn-primary btn-block mt-1',
          id: 'broadcast-transaction',
          $text: 'Broadcast Transaction',
          onclick () {
            config.nodeSelected = config._chooseBackUrl(self._networkName)
            TransactionService(config).broadcast(self._rawtx).then(() => {
              showSuccess('Transaction Broadcasted')
            })
          }
        })
      }
    },
    $$: [
      { $virus: selectGroupism('Network', (<any> window)._.keys(networks)),
        name: 'network',
        $update () { this.value = this._networkName },
        onchange (e: Event) { this._networkName = (<HTMLInputElement> e.target).value }
      },
      { $tag: '.form-group textarea#tansaction_json.form-control',
        name: 'transaction_json',
        rows: 15,
        onchange (e: Event) { this._transactionJson = (<HTMLInputElement> e.target).value },
        $update () {
          this.$text = JSON.stringify(this._transactionJson)
        }
      },
      { $tag: 'button.btn.btn-primary.btn-block.mt-1',
        id: 'sign-transaction',
        $text: 'Sign transaction',
        _handleSigningResult (result: {json: string, rawtx: string, done: boolean}) {
          this._transactionJson = result.json
          this._rawtx = result.rawtx
          if (result.done) {
            showSuccess('All signed, try to propagate rawtx')
          }
        },
        async onclick () {
          let transaction = new Transaction()
          let transactionJson = typeof (this._transactionJson) === 'string' ? JSON.parse(this._transactionJson) : this._transactionJson
          try {
            let result = await transaction.signTransaction(transactionJson, this._networkName)
            this._handleSigningResult(result)
          } catch (error) {
            showError(error.json)
          }
        }
      }
    ]
  }
}

function exampleSpendAddressJson () { // eslint-disable-line no-unused-vars
  /*
  This transaction sends money from a regular (paytoaddress) address to itself.

  device_seed: 'custodian popup test'
  path: '0/1/2/3'
  address: 'mgYDL9xvE9bDAXQdWseNttP5V6iaRmBVZK'
  utxo: ['cb7ae6beaeda9591ec9be0d6de8d363e57d4a5f4dc4bf79a33fb6c942c09e02b', 0]
  https://testnet.blockexplorer.com/api/tx/cb7ae6beaeda9591ec9be0d6de8d363e57d4a5f4dc4bf79a33fb6c942c09e02b
  */
  return {
    outputs: [{
      script_type: 'PAYTOADDRESS',
      address: 'mgYDL9xvE9bDAXQdWseNttP5V6iaRmBVZK',
      amount: 130000000
    }],
    inputs: [{
      address_n: [0, 1, 2, 3],
      prev_hash: 'cb7ae6beaeda9591ec9be0d6de8d363e57d4a5f4dc4bf79a33fb6c942c09e02b',
      prev_index: 0
    }],
    transactions: [{
      hash: 'cb7ae6beaeda9591ec9be0d6de8d363e57d4a5f4dc4bf79a33fb6c942c09e02b',
      version: 1,
      lock_time: 0,
      inputs: [{
        prev_hash: 'f52d8e97d39d0daa3d324c516a1e989975df74cc5ef6bdfa33e151310b22e176',
        prev_index: 1,
        sequence: 4294967295,
        script_sig: '160014b5cfcd65d0764a18ae74c583c2b341cb97335323' // HEX, not ASM.
      }],
      bin_outputs: [{
        amount: 130000000,
        script_pubkey: '76a9140b3517e6562623042f7ae1fa9da19d3106841a8a88ac' // HEX, not ASM.
      },
      {
        amount: 6922866917,
        script_pubkey: 'a91490a8548f36918a89d39d7eb0a8c8b3f095478e8987' // HEX, not ASM.
      }]
    }]
  }
}
