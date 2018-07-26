import * as device from '../device.js'
import {showError, showSuccess, loading, notLoading} from '../messages.js'
import {blockdozerService} from '../services/blockdozer_service.js'
import * as Web3 from 'web3'
import EthereumTx from 'ethereumjs-tx'

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
    signTransaction(original_json, coin){
      let rawJson = _.cloneDeep(original_json)
      let json = null
      if (typeof rawJson == 'string') {
        json = JSON.parse(_.cloneDeep(original_json))
      } else if (typeof rawJson == 'object') {
        json = rawJson
      }
      loading()
      return device.run((d) => {
        return d.session.signTx(json.inputs, json.outputs, json.transactions, coin)
          .then((res) => {
            let signed = res.message.serialized.serialized_tx
            let signatures = res.message.serialized.signatures
            if(_.some(json.inputs, (i) => i.multisig )) {
              return d.session.getPublicKey([]).then( (result) => {
                let publicKey = result.message.node.public_key
                _.each(json.inputs, (input, inputIndex) => {
                  let signatureIndex = _.findIndex(input.multisig.pubkeys,
                    (p) => p.node.public_key == publicKey)
                  input.multisig.signatures[signatureIndex] = signatures[inputIndex]
                })

                let done = _.every(json.inputs, (i) => {
                  return _.compact(i.multisig.signatures).length >= i.multisig.m
                })

                notLoading()
                return {json: json, done: done, rawtx: signed}
              })
            }else{
              return { json: json, done: true, rawtx: signed }
            }
          })
      })
    },
    signRskTransaction(path, to, from, gasPriceGwei, gasLimitFromParam, value, data) {
      let self = this
      loading()
      return device.run((d) => {
        let web3 = self.getWeb3()
        let count = null
        self.getGasPrice((gasValue) => {
          let gasPrice = gasPriceGwei === null ? `0${gasValue}` : gasPriceGwei * 1e9
          let gasLimit = gasLimitFromParam  === null ? self.getGasLimit(data) : gasLimitFromParam

          self.getNonce(from).then(nonce => {

            let gasLimitForTrezor = gasLimit.toString().length % 2 === 0 ? gasLimit.toString() : `0${gasLimit}`

            d.session.signEthTx(path, nonce, gasPrice.toString(), gasLimitForTrezor, to, value.toString(), null, 33).then(function (response) {
              let tx = {
                nonce: `0x${nonce}`,
                gasPrice: `0x${gasPrice}`,
                gasLimit: `0x${gasLimit}`,
                to: `0x${to}`,
                value: `0x${value}`,
                data,
                chainId: 33,
                from: `0x${from}`
              }
              tx.v =  response.v
              tx.r = `0x${response.r}`
              tx.s = `0x${response.s}`
              let ethtx = new EthereumTx(tx)
              const serializedTx = ethtx.serialize()
              const rawTx = '0x' + serializedTx.toString('hex')
              web3.eth.sendSignedTransaction(rawTx).on('receipt', console.log).on('error', console.log)
            })
          })
        })
      })
    },
    getGasPrice(callback) {
      let web3 = this.getWeb3()
      //ethGasPrice
      let gasPrice = web3.eth.getGasPrice().then(response => {
        callback(response === '0' ? 1 : response)
      })
    },
    getGasLimit(data) {
      let dataSizeInBytes = data === null ? 1 : (new TextEncoder('utf-8').encode(data)).length
      return 21000 + 68 * dataSizeInBytes
    },
    getNonce(address) {
      let web3 = this.getWeb3()
      return new Promise (function (resolve, reject) {
        web3.eth.getTransactionCount(address, 'pending', function (error, result) {
          resolve(`0${result}`)
        })
      })
    },
    getWeb3 () {
      debugger
      return new Web3.default(new Web3.providers.HttpProvider('http://localhost:4444'))
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
