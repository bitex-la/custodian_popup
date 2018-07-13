import {blockdozerService} from '../services/blockdozer_service.js'

export function Transaction(_networkName) {
  return {
    _transaction: {
      outputs: [],
      inputs: [],
      transactions: []
    },
    _calculateFee(_networkName, outputLength, callback) {
      let self = this
      blockdozerService().satoshisPerByte(_networkName).done((data) => {
        let satoshis = parseFloat(data[2]) * 100000000
        let fee = (10 + (149 * self._transaction.inputs.length) + (35 * outputLength)) * satoshis
        callback(fee)
      })
    },
    createTx: function (_this, callback) {
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
              pubkeys: rawTx.attributes.multisig.pubkeys
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

      self._calculateFee(_this._networkName, _this._outputs.length, (fee) => {
        self._transaction.outputs = _.map(_this._outputs, (output) => {
          let outputResult = Object.assign({}, output)
          outputResult['amount'] = outputResult['amount'] - fee
          return outputResult
        })
        callback(self._transaction)
      })
    },
    getExpensiveRskTransactions(account, startBlockNumber, endBlockNumber) {
      if (endBlockNumber == null) {
        endBlockNumber = eth.blockNumber
        console.log("Using endBlockNumber: " + endBlockNumber)
      }
      if (startBlockNumber == null) {
        startBlockNumber = endBlockNumber - 1000
        console.log("Using startBlockNumber: " + startBlockNumber)
      }
      console.log("Searching for transactions to/from account \"" + account + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber)

      var transactions = []
      for (var i = startBlockNumber; i <= endBlockNumber; i++) {
        if (i % 1000 == 0) {
          console.log("Searching block " + i)
        }
        var block = eth.getBlock(i, true)
        if (block != null && block.transactions != null) {
          block.transactions.forEach( function(e) {
            if (account == "*" || account == e.from || account == e.to) {
              transactions.push({
                tx_hash: e.hash,
                nonce: e.nonce,
                blockHash: e.blockHash,
                blockNumber: e.blockNumber,
                transactionIndex: e.transactionIndex,
                from: e.from,
                to: e.to,
                value: e.value,
                timestamp: block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString(),
                gasPrice: e.gasPrice,
                gas: e.gas,
                input: e.input
              })
            }
          })
        }
      }
      return transactions
    }
  }
}
