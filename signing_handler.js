import * as device from './device.js'
import * as helpers from './helpers.js'
import * as bitcoin from 'bitcoinjs-lib'
import {showError, loading, notLoading} from './messages.js'
var bip32 = require('bip32-path')
var _ = require('lodash')
 
window.bitcoin = bitcoin

export function signingHandler(){
  return {
    id: 'signing',
    class: 'form',
    _transaction_json: '',
    $$: [
      { $tag: '.form-group', $$: [
        { $tag: 'label', $text: 'Transaction JSON' },
        { $tag: 'textarea#tansaction_json.form-control',
          name: 'transaction_json',
          rows: 20,
          $update(){ this.$text = this._transaction_json }
        },
      ]},
      { $tag: 'button.btn.btn-default.btn-block',
        $text: 'Load example transaction',
        onclick(){ this._transaction_json = example_transaction }
      },
      { $tag: 'button.btn.btn-default.btn-block',
        $text: 'Sign transaction',
        onclick(){
          signTransaction(_transaction_json)
            .then((signed) => this._transaction_json = signed )
        }
      }
    ]
  }
}

function exampleTransactionJson(){
  return {
  }
}

function signTransaction(json, coin){
  loading()
  device.run((d) => {
    return d.session.signTx(json.inputs, json.outputs, json.transactions, coin)
      .then((res) => {
        notLoading()
        let signed = res.message.serialized.serialized_tx
        let signatures = res.message.serialized.signatures
        return session.getPublicKey([]).then( (result) => {
          let publicKey = result.message.node.public_key
          _.each(json.inputs, (input, inputIndex) => {
            let signatureIndex = _.findIndex input.multisig.pubkeys, (p) ->
              p.node.public_key == publicKey
            input.multisig.signatures[signatureIndex] = signatures[inputIndex]
          })
          return json
        })
      })
  })
}
