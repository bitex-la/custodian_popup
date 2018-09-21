import * as _  from 'lodash';

import { loading, notLoading } from '../messages';
import { blockdozerService } from '../services/blockdozer_service';
import { blockcypherService } from '../services/blockcypher_service';
import { TransactionService } from '../services/transaction_service';
import config from '../config';

const Web3 = require('web3');
const rskUtils = require('bitcoin-to-rsk-key-utils/rsk-conversion-utils.js');
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

interface MultiSig {
  signatures: Array<string>;
  m: number;
  pubkeys: Array<{ node: { public_key: string } }>;
}

interface Input {
  address_n: Array<number>; 
  prev_hash: string; 
  prev_index: string; 
  sequence?: string;
  script_sig?: string;
  multisig?: MultiSig; 
  script_type?: string;
}

interface Output {
  script_type?: string;
  address: string;
  amount: string;
  script_pubkey?: string;
}

export interface InTransaction {
  outputs: Array<Output>;
  inputs: Array<Input>;
  transactions: Array<object>;
}

interface SimpleTransaction {
  transaction_hash: string;
  position: string;
  version: string;
  locktime: number;
  inputs: Array<{ prev_hash: string; prev_index: string; sequence: string; script_sig: string }>;
  outputs: Array<{ amount: string; script_pubkey: string }>
}

interface AddressTransaction {
  path: string;
}

interface CompleteTransaction {
  address: AddressTransaction;
  transaction: SimpleTransaction;
  multisig: MultiSig;
}

function isCompleteTransaction(transaction: SimpleTransaction | CompleteTransaction): transaction is CompleteTransaction {
  return (<CompleteTransaction>transaction).transaction !== undefined;
}

function isSimpleTransaction(transaction: SimpleTransaction | CompleteTransaction): transaction is SimpleTransaction {
  return (<SimpleTransaction>transaction).transaction_hash !== undefined;
}

interface RawTx {
  attributes: CompleteTransaction | SimpleTransaction
}

interface HandleParent {
  _walletType: string;
  _rawTransaction: Array<RawTx>;
  _networkName: string;
  _outputs: Array<object>;
}

interface SignedResponse {
  json: any;
  done: boolean;
  rawtx: string;
}

export interface Address {
  toString: () => string;
  balance: string;
  type: string;
}

type Bitcoin = "Bitcoin"
type Rsk = "Rsk"

type Network  = Bitcoin | Rsk

export class Transaction {

  transaction: InTransaction = { outputs: [], inputs: [], transactions: [] };

  async _addAddressFromTrezor (network: Network, _derivationPath: number[], coin?: string): Promise<{}> {
    switch(network) {
      case "Rsk":
        return this._addRskAddressFromTrezor(_derivationPath);
      case "Bitcoin":
        return this._addBtcAddressFromTrezor(_derivationPath, coin);
    }
  }

  async _addBtcAddressFromTrezor (_derivationPath: number[], coin: string): Promise<{}> {
    const btcAddress = await (<any> window).TrezorConnect.getAddress({path: _derivationPath, coin: coin});
    if (btcAddress.success) {
      let transaction = new Transaction();
      let balance = await transaction.getBalance('bitcoin', btcAddress.payload.address);
      return new Promise(resolve => resolve({ toString: () => btcAddress.payload.address, balance, type: 'btc' }));
    } else {
      throw new Error(btcAddress.payload.error);
    }
  }

  async _addRskAddressFromTrezor (_derivationPath: number[]): Promise<{}> {
    const ethAddress = await (<any> window).TrezorConnect.ethereumGetAddress({path: _derivationPath});
    if (ethAddress.success) {
      try {
        let balance: string = await this.getRskBalance(ethAddress.payload.address.toLowerCase());
        let address: Address = { 
          toString: () => ethAddress.payload.address.toLowerCase(),
          type: 'rsk',
          balance
        };
        return new Promise((resolve) => resolve(address));
      } catch (e) {
        throw new Error(e);
      }
    } else {
      throw new Error(ethAddress.payload.error);
    }
  }

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

  async createTx (_this: HandleParent, _networkName: string): Promise<InTransaction> {
    let self = this;
    _.forEach(_this._rawTransaction, function (rawTx: RawTx) {
      let path = [];
      let transaction: SimpleTransaction = null;
      let multisig: MultiSig = null;
      if (rawTx.attributes === undefined) {
        return;
      }

      if (isCompleteTransaction(rawTx.attributes)) {
        if (rawTx.attributes.address.path && rawTx.attributes.address.path.length > 0) {
          path = JSON.parse(rawTx.attributes.address.path);
        } else {
          path = config._chooseDerivationPath(_networkName);
        }
        transaction = rawTx.attributes.transaction;
        if (rawTx.attributes.multisig) {
          multisig = {
            signatures: rawTx.attributes.multisig.signatures,
            m: rawTx.attributes.multisig.m,
            pubkeys: rawTx.attributes.multisig.pubkeys
          };
        }
      } else if (isSimpleTransaction(rawTx.attributes)) {
        path = config._chooseDerivationPath(_networkName);
        transaction = rawTx.attributes;
      }

      if (_this._walletType === '/hd_wallets') {
        self.transaction.inputs.push({
          address_n: path,
          prev_hash: transaction.transaction_hash,
          prev_index: transaction.position
        });
      } else if (_this._walletType === '/multisig_wallets') {
        self.transaction.inputs.push({
          address_n: path,
          prev_hash: transaction.transaction_hash,
          prev_index: transaction.position,
          script_type: 'SPENDMULTISIG',
          multisig: multisig
        });
      }
      self.transaction.transactions.push({
        hash: transaction.transaction_hash,
        version: transaction.version,
        lock_time: transaction.locktime,
        inputs: _.map(transaction.inputs, function(input: Input) {
          return {
            prev_hash: input.prev_hash,
            prev_index: input.prev_index,
            sequence: input.sequence,
            script_sig: input.script_sig
          }
        }),
        bin_outputs: _.map(transaction.outputs, function(output: Output) {
          return {
            amount: output.amount.toString(),
            script_pubkey: output.script_pubkey
          }
        })
      });
    });

    await self.calculateFee(_networkName, _this._outputs.length, (fee: number) => {
      self.transaction.outputs = _.map(_this._outputs, (output: Output) => {
        let outputResult = (<any>Object).assign({}, output)
        outputResult['amount'] = outputResult['amount'] - fee
        return outputResult
      });
    });
    return new Promise<InTransaction>((resolve, reject) => resolve(self.transaction) );
  }
 
  async signTransaction (original_json: InTransaction, coin: string): Promise<SignedResponse> {
    let json = _.cloneDeep(original_json);
    loading();
    json.outputs = _.map(json.outputs, (output: Output) => { output['amount'] = output.amount.toString(); return output});
    const result = await (<any>window).TrezorConnect.signTransaction({inputs: json.inputs, outputs: json.outputs, coin});
    if (result.success) {
      let signed = result.payload.serializedTx;
      let signatures = result.payload.signatures;

      if(_.some(json.inputs, (i: Input) => i.multisig )) {
        const resultPk = await (<any>window).TrezorConnect.getPublicKey({path: []});
        if (resultPk.success) {

          let publicKey = result.payload.node.public_key;
          _.each(json.inputs, (input: Input, inputIndex: string) => {
            let signatureIndex = _.findIndex(input.multisig.pubkeys,
              (p: { node: { public_key: string } }) => p.node.public_key == publicKey);
            input.multisig.signatures[signatureIndex] = signatures[inputIndex];
          })

          let done = _.every(json.inputs, (i: Input) => {
            return _.compact(i.multisig.signatures).length >= i.multisig.m;
          })

          notLoading();
          return new Promise<SignedResponse>((resolve, reject) => resolve({json, done, rawtx: signed}) );

        } else {
          return new Promise<SignedResponse>((resolve, reject) => {
            reject({json: resultPk.payload.error, done: false, rawtx: null})
          });
        }
      }else{
        return new Promise<SignedResponse>(resolve => resolve({json: json, done: true, rawtx: signed}));
      }
    } else {
      return new Promise<SignedResponse>((resolve, reject) => {
        if (result.payload) {
          reject({json: result.payload.error, done: false, rawtx: null});
        } else {
          reject({json: result.message, done: false, rawtx: null});
        }
      });
    }
  }

  async getBalanceFromOutside(network: string, address: string): Promise<string> {
    let balance = await blockcypherService().balance(network, address);
    return balance.final_balance;
  }

  async getBalance(network: string, address: string): Promise<string> {
    config.nodeSelected = config._chooseBackUrl(network);
    let transaction = await TransactionService(config);
    return transaction.balance(address);
  }

  async sendRskTransaction(network: string, path: number[], to: string, _from: string, gasPriceGwei: number, value: number, data?: string) {
    let self = this;
    loading();
    let web3 = self.getWeb3();
    let gasValue: number = await self.getGasPrice();
    let gasPrice: number = gasPriceGwei === null ? gasValue : gasPriceGwei * 1e9;
    let gasEstimated: number = await self.estimateGas(data, to);
    let nonce: string = await self.getNonce(_from);
    let finalValue = value - (gasPrice * gasEstimated);

    const result = await (<any>window).TrezorConnect.ethereumSignTransaction({
      path,
      transaction: {
        to,
        value: `0x${finalValue.toString(16)}`,
        data: "",
        chainId: config._getRskChainId(network),
        nonce: `0x${nonce}`,
        gasLimit: `0x${gasEstimated.toString(16)}`,
        gasPrice: `0x${gasPrice.toString(16)}`
      }
    });

    if (result.success) {
      let tx = {
        nonce: `0x${nonce}`,
        gasPrice: `0x${gasPrice.toString(16)}`,
        gasLimit: `0x${gasEstimated.toString(16)}`,
        to: to,
        value: `0x${finalValue.toString(16)}`,
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
      return web3.eth.sendSignedTransaction(rawTx);
    } else {
      throw new Error(result.payload.error);
    }
  }

  async sendBtcTransaction(network: string, path: number[], to: string, _from: string, value: number) {
    let params = {
      outputs: [
        {
           amount: value.toString(),
           address: to
         }
      ],
      coin: network,
      push: true
    };
    let result = await (<any> window).TrezorConnect.composeTransaction(params);
    if (result.success) {
      let signed = result.payload.serializedTx;

      config.nodeSelected = config._chooseBackUrl(network);
      return TransactionService(config).broadcast(signed);
    } else {
      throw new Error(result.payload.error);
    }
  }

  async getGasPrice(): Promise<number> {
    let web3 = this.getWeb3();
    let getLatestBlock: any = await web3.eth.getBlock('latest');
    let rawGas = parseFloat(getLatestBlock.minimumGasPrice);
    let gasPrice = rawGas === 0 ? 0.001 : rawGas;
    return (gasPrice * 10000);
  }

  getGasLimit(data: string): number {
    let dataSizeInBytes = data === null ? 1 : (new TextEncoder().encode(data)).length;
    let rawGasLimit: number = 21000 + 68 * dataSizeInBytes;
    return rawGasLimit;
  }

  async estimateGas(data: string, to: string): Promise<number> {
    let web3 = this.getWeb3();
    return await web3.eth.estimateGas({to, data});
  }

  async getNonce(address: string): Promise<string> {
    let web3 = this.getWeb3();
    let rawNonce: number = await web3.eth.getTransactionCount(address);
    return `${rawNonce.toString(16)}`;
  }

  getFederationAdress(network: string): Promise<string> {
    var web3: any = new Web3(config._getUrlRskNode(network));

    var abi: Array<ABIDefinition> = [
      {
        "name": "getFederationAddress",
        "type": "function",
        "constant": true,
        "inputs": [],
        "outputs": [{ "name": "", "type": "string" }]
      }
    ];
    var address = "0x0000000000000000000000000000000001000006";

    var contract = new web3.eth.Contract(abi, address);

    return new Promise((resolve, reject) => {
      contract.methods.getFederationAddress()
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
