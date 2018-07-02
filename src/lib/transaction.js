import {blockdozerService} from '../services/blockdozer_service.js'

export function Transaction(_networkName) {
  return {
    _transaction: {
      outputs: [],
      inputs: [],
      transactions: []
    },
    _calculateFee(_networkName, callback) {
      let self = this
      blockdozerService().satoshisPerByte(_networkName, (sxb) => {
        let fee = (10 + (149 * self._transaction.inputs.length ) + (35 * self._transaction.outputs.length) ) * sxb
        callback(fee)
      })
    },
    createTx: function (_this) {
      let self = this
      _.forEach(_this._rawTransaction, function (rawTx) {
        if (_this._walletType == '/hd_wallets') {
          self._transaction.inputs.push({
            address_n: rawTx.attributes.address.path,
            prev_hash: rawTx.attributes.transaction.transaction_hash,
            prev_index: rawTx.attributes.transaction.position
          })
        } else if (_this._walletType == '/multisig_wallets') {
          self._transaction.inputs.push({
            address_n: rawTx.attributes.address.path,
            prev_hash: rawTx.attributes.transaction.transaction_hash,
            prev_index: rawTx.attributes.transaction.position,
            script_type: 'SPENDMULTISIG',
            multisig: {
              signatures: rawTx.attributes.multisig.signatures,
              m: rawTx.attributes.multisig.m,
              pubkeys: rawTx.attributes.pubkeys
            }
          })
        }
        self._transaction.transactions.push({
          hash: rawTx.attributes.transaction.transaction_hash,
          version: rawTx.attributes.transaction.version,
          lock_time: rawTx.attributes.transaction.locktime,
          inputs: _.map(rawTx.attributes.transaction.inputs, function(input) {
            return {
              prev_hash: input.prev_hash,
              prev_index: input.prev_index,
              sequence: input.sequence,
              script_sig: input.script_sig
            }
          }),
          bin_outputs: _.map(rawTx.attributes.transaction.outputs, function(output) {
            return {
              amount: output.amount,
              script_pubkey: output.script_pubkey
            }
          })
        })
      })

      self._calculateFee(_this._networkName, (fee) => {
        _.forEach(_this._outputs, (output) => output['amount'] = output.amount - fee)
      })
      self._transaction.outputs = _this._outputs
      return self._transaction
    }
  }
}
