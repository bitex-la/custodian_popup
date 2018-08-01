import * as _  from 'lodash';

import {showError, showSuccess, loading, notLoading} from '../messages';
import {blockdozerService} from '../services/blockdozer_service.js';
import config from '../config.js';

const TrezorConnect = require('trezor-connect').default;
const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx');

interface InTransaction {
  outputs: Array<object>;
  inputs: Array<{ 
    address_n: string; 
    prev_hash: string; 
    prev_index: string; 
    multisig?: { pubkeys: Array<{ node: { public_key: string } }>, signatures: Array<string>, m: number }; 
    script_type?: string;
  }>;
    
  transactions: Array<object>;
}

interface RawTx {
  attributes: {
    address: {
      path: string;
    };

    transaction: {
      transaction_hash: string;
      position: string;
      version: string;
      locktime: number;
      inputs: Array<{ prev_hash: string; prev_index: string; sequence: string; script_sig: string }>;
      outputs: Array<{ amount: number; script_pubkey: string }>
    };

    multisig: {
      signatures: Array<string>;
      m: number;
      pubkeys: Array<{ node: { public_key: string } }>;
    }
  }
}

interface HandleParent {
  _walletType: string;
  _rawTransaction: Array<RawTx>;
  _networkName: string;
  _outputs: Array<object>;
}

export class Transaction {

  _transaction: InTransaction;

  calculateFee (_networkName: string, outputLength: number, callback: Function) {
    blockdozerService().satoshisPerByte(_networkName).done((data: {2: string}) => {
      let satoshis = parseFloat(data[2]) * 100000000;
      let fee = (10 + (149 * this._transaction.inputs.length) + (35 * outputLength)) * satoshis;
      callback(fee);
    })
  }

  createTx (_this: HandleParent, _networkName: string, callback: Function) {
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

    self.calculateFee(_networkName, _this._outputs.length, (fee: number) => {
      self._transaction.outputs = _.map(_this._outputs, (output) => {
        let outputResult = (<any>Object).assign({}, output)
        outputResult['amount'] = outputResult['amount'] - fee
        return outputResult
      })
      callback(self._transaction)
    })
  }
 
  async signTransaction (original_json: InTransaction, coin: string) {
    let json = _.cloneDeep(original_json);
    loading();
    const result = await TrezorConnect.signTransaction({inputs: json.inputs, outputs: json.outputs, coin});
    if (result.success) {
      let signed = result.payload.serializedTx;
      let signatures = result.payload.signatures;

      if(_.some(json.inputs, (i) => i.multisig )) {
        const resultPk = await TrezorConnect.getPublicKey({path: []});
        if (resultPk.success) {

          let publicKey = result.payload.node.public_key;
          _.each(json.inputs, (input, inputIndex) => {
            let signatureIndex = _.findIndex(input.multisig.pubkeys,
              (p: { node: { public_key: string } }) => p.node.public_key == publicKey);
            input.multisig.signatures[signatureIndex] = signatures[inputIndex];
          })

          let done = _.every(json.inputs, (i) => {
            return _.compact(i.multisig.signatures).length >= i.multisig.m;
          })

          notLoading();
          return {json: json, done: done, rawtx: signed};

        } else {
          showError(resultPk.payload.error);
        }
      }else{
        return { json: json, done: true, rawtx: signed };
      }
    }

  }

  async signRskTransaction(path: Array<number>, to: string, _from: string, gasPriceGwei: number, gasLimitFromParam: string, value: string, data?: string) {
    let self = this;
    loading();
    let web3 = self.getWeb3();
    let count = null;
    let gasValue: number = await self.getGasPrice();
    let gasPrice = gasPriceGwei === null ? `0${gasValue}` : gasPriceGwei * 1e9;
    let gasLimit = gasLimitFromParam  === null ? self.getGasLimit(data) : gasLimitFromParam;
    let nonce: string = await self.getNonce(_from);
    let gasLimitForTrezor: string = gasLimit.toString().length % 2 === 0 ? gasLimit.toString() : `0${gasLimit}`;

    const result = await TrezorConnect.ethereumSignTransaction({
      path,
      transaction: {
        to,
        value: `0x${value}`,
        data: "",
        chainId: 33,
        nonce: `0x${nonce}`,
        gasLimit: `0x${gasLimit}`,
        gasPrice: `0x${gasPrice}`
      }
    });

    if (result.success) {
      let tx = {
        nonce: `0x${nonce}`,
        gasPrice: `0x${gasPrice}`,
        gasLimit: `0x${gasLimit}`,
        to: to,
        value: `0x${value}`,
        data,
        chainId: 33,
        from: _from,
        v: 0,
        r: '',
        s: ''
      };
      tx.v =  result.payload.v;
      tx.r = result.payload.r;
      tx.s = result.payload.s;
      let ethtx = new EthereumTx(tx);
      const serializedTx = ethtx.serialize();
      const rawTx = '0x' + serializedTx.toString('hex');
      web3.eth.sendSignedTransaction(rawTx).on('receipt', console.log).on('error', console.log);
    } else {
      showError(result.payload.error);
    }
  }

  getGasPrice(): Promise<number> {
    let web3 = this.getWeb3()
    return new Promise(resolve => {
      web3.eth.getGasPrice().then((response: string) => {
        resolve(response === '0' ? 1 : parseFloat(response))
      })
    })
  }

  getGasLimit(data: string) {
    let dataSizeInBytes = data === null ? 1 : (new TextEncoder().encode(data)).length
    return 21000 + 68 * dataSizeInBytes
  }

  getNonce(address: string): Promise<string> {
    let web3 = this.getWeb3()
    return new Promise((resolve, reject) => {
      web3.eth.getTransactionCount(address.toLowerCase(), 'pending', function (error: any, result: string) {
        resolve(`0${result}`)
      });
    });
  }

  getWeb3 () {
    return new Web3(new Web3.providers.HttpProvider(config.rskNodeUrl))
  }
}
