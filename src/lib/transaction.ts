import * as _  from 'lodash';

import { showError, showSuccess, loading, notLoading } from '../messages';
import { blockdozerService } from '../services/blockdozer_service.js';
import { blockcypherService } from '../services/blockcypher_service.js';
import { transactionService } from '../services/transaction_service.js';
import config from '../config';

const rskUtils = require('bitcoin-to-rsk-key-utils/rsk-conversion-utils.js');
const Web3 = require('web3');
const EthereumTx = require('ethereumjs-tx');

interface ABIDefinition {
    constant?: boolean;
    payable?: boolean;
    anonymous?: boolean;
    inputs?: Array<{ name: string; type: ABIDataTypes; indexed?: boolean }>;
    name?: string;
    outputs?: Array<{ name: string; type: ABIDataTypes }>;
    type: "function" | "constructor" | "event" | "fallback";
}

type ABIDataTypes = "uint256" | "boolean" | "string" | "bytes" | string;

interface Input {
  address_n: Array<number>; 
  prev_hash: string; 
  prev_index: string; 
  sequence?: string;
  script_sig?: string;
  multisig?: { pubkeys: Array<{ node: { public_key: string } }>, signatures: Array<string>, m: number }; 
  script_type?: string;
}

interface Output {
  script_type?: string;
  address: string;
  amount: string;
  script_pubkey?: string;
}

interface InTransaction {
  outputs: Array<Output>;

  inputs: Array<Input>;
    
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
      outputs: Array<{ amount: string; script_pubkey: string }>
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

interface signedResponse {
  json: any;
  done: boolean;
  rawtx: string;
}

export class Transaction {

  transaction: InTransaction = { outputs: [], inputs: [], transactions: [] };

  async calculateFee (_networkName: string, outputLength: number, callback: Function) {
    let calculateFee = (response: {2: string}, callback: Function) => {
      let satoshis = parseFloat(response[2]) * 100000000;
      let fee = (10 + (149 * this.transaction.inputs.length) + (35 * outputLength)) * satoshis;
      callback(fee);
    }
    try {
      let response = await blockdozerService().satoshisPerByte(_networkName, false);
      calculateFee(response, callback);
    } catch {
      let response = await blockdozerService().satoshisPerByte(_networkName, true);
      calculateFee(response, callback);
    }
  }

  createTx (_this: HandleParent, _networkName: string, callback: Function) {
    let self = this
    _.forEach(_this._rawTransaction, function (rawTx: RawTx) {
      if (_this._walletType === '/hd_wallets') {
        self.transaction.inputs.push({
          address_n: rawTx.attributes.address.path.length === 0 ? config._chooseDerivationPath(_networkName) : JSON.parse(rawTx.attributes.address.path),
          prev_hash: rawTx.attributes.transaction.transaction_hash,
          prev_index: rawTx.attributes.transaction.position
        });
      } else if (_this._walletType === '/multisig_wallets') {
        self.transaction.inputs.push({
          address_n: rawTx.attributes.address.path.length === 0 ? config._chooseDerivationPath(_networkName) : JSON.parse(rawTx.attributes.address.path),
          prev_hash: rawTx.attributes.transaction.transaction_hash,
          prev_index: rawTx.attributes.transaction.position,
          script_type: 'SPENDMULTISIG',
          multisig: {
            signatures: rawTx.attributes.multisig.signatures,
            m: rawTx.attributes.multisig.m,
            pubkeys: rawTx.attributes.multisig.pubkeys
          }
        });
      }
      self.transaction.transactions.push({
        hash: rawTx.attributes.transaction.transaction_hash,
        version: rawTx.attributes.transaction.version,
        lock_time: rawTx.attributes.transaction.locktime,
        inputs: _.map(rawTx.attributes.transaction.inputs, function(input: Input) {
          return {
            prev_hash: input.prev_hash,
            prev_index: input.prev_index,
            sequence: input.sequence,
            script_sig: input.script_sig
          }
        }),
        bin_outputs: _.map(rawTx.attributes.transaction.outputs, function(output: Output) {
          return {
            amount: output.amount.toString(),
            script_pubkey: output.script_pubkey
          }
        })
      });
    });

    self.calculateFee(_networkName, _this._outputs.length, (fee: number) => {
      self.transaction.outputs = _.map(_this._outputs, (output: Output) => {
        let outputResult = (<any>Object).assign({}, output)
        outputResult['amount'] = outputResult['amount'] - fee
        return outputResult
      });
      callback(self.transaction)
    });
  }
 
  async signTransaction (original_json: InTransaction, coin: string): Promise<signedResponse> {
    let json = _.cloneDeep(original_json);
    loading();
    json.outputs = _.map(json.outputs, (output: Output) => { output['amount'] = output.amount.toString(); return output});
    const result = await (<any>window).TrezorConnect.signTransaction({inputs: json.inputs, outputs: json.outputs, coin});
    if (result.success) {
      let signed = result.payload.serializedTx;
      let signatures = result.payload.signatures;

      if(_.some(json.inputs, (i) => i.multisig )) {
        const resultPk = await (<any>window).TrezorConnect.getPublicKey({path: []});
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
          return new Promise<signedResponse>((resolve, reject) => resolve({json, done, rawtx: signed}) );

        } else {
          return new Promise<signedResponse>((resolve, reject) => {
            reject({json: resultPk.payload.error, done: false, rawtx: null})
          });
        }
      }else{
        return new Promise<signedResponse>(resolve => resolve({json: json, done: true, rawtx: signed}));
      }
    } else {
      return new Promise<signedResponse>((resolve, reject) => {
        reject({json: result.payload.error, done: false, rawtx: null})
      });
    }
  }

  async getBalanceFromOutside(network: string, address: string): Promise<string> {
    let balance = await blockcypherService().balance(network, address);
    return balance.final_balance;
  }

  async getBalance(network: string, address: string): Promise<string> {
    config.nodeSelected = config._chooseBackUrl(network);
    let transaction = await transactionService(config);
    return transaction.balance(address);
  }

  async signRskTransaction(network: string, to: string, _from: string, gasPriceGwei: number, gasLimitFromParam: string, value: number, data?: string) {
    let self = this;
    loading();
    let web3 = self.getWeb3();
    let path = config._chooseDerivationRskPath(network);
    let gasValue: string = await self.getGasPrice();
    let gasPrice = gasPriceGwei === null ? gasValue : gasPriceGwei * 1e9;
    let gasLimit = gasLimitFromParam  === null ? self.getGasLimit(data) : gasLimitFromParam;
    let nonce: string = await self.getNonce(_from);

    const result = await (<any>window).TrezorConnect.ethereumSignTransaction({
      path,
      transaction: {
        to,
        value: `0x${value.toString(16)}`,
        data: "",
        chainId: config._getRskChainId(network),
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
        value: `0x${value.toString(16)}`,
        data,
        chainId: config._getRskChainId(network),
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

  async getGasPrice(): Promise<string> {
    let web3 = this.getWeb3();
    let rawGas = await web3.eth.getBlock('latest');
    return parseInt(rawGas.minimumGasPrice).toString(16);
  }

  getGasLimit(data: string): string {
    let dataSizeInBytes = data === null ? 1 : (new TextEncoder().encode(data)).length;
    let rawGasLimit: number = 21000 + 68 * dataSizeInBytes;
    return rawGasLimit.toString(16);
  }

  async getNonce(address: string): Promise<string> {
    let web3 = this.getWeb3();
    let rawNonce: number = await web3.eth.getTransactionCount(address);
    return `${rawNonce.toString(16)}`;
  }

  getFederationAdress(network: string): Promise<string> {
    var web3 = new Web3(config._getUrlRskNode(network));

    var abi: Array<ABIDefinition> = [{ "name": "getFederationAddress", "type": "function", "constant": true, "inputs": [], "outputs": [{ "name": "", "type": "string" }] }];
    var address = "0x0000000000000000000000000000000001000006";

    var FedContract = new web3.eth.Contract(abi, address);

    return new Promise((resolve, reject) => {
      FedContract.methods.getFederationAddress()
        .call()
        .then((result: string) => resolve(result))
        .catch((result: any) => reject(result))
    });
  }

  getRskBalance(address: string): Promise<string> {
    let web3 = this.getWeb3();
    return new Promise((resolve, reject) => {
      web3.eth.getBalance(address).then((balance: string) => resolve(balance)).catch((error: string) => reject(error));
    })
  }

  getRskPrivateKeyFromBtc(privKey: string) {
    return rskUtils.privKeyToRskFormat(privKey);
  }

  getRskAddressFromBtc(privKey: string) {
    return rskUtils.getRskAddress(privKey);
  }

  getBtcPrivKeyFromRsk(net: string, privKey: string) {
    return rskUtils.getBtcPrivateKey(net, privKey);
  }

  getWeb3 () {
    return new Web3(new Web3.providers.HttpProvider(config.rskNodeUrl))
  }
}
