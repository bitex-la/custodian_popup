import * as _ from "lodash";

import { loading, notLoading } from "../messages";
import { blockdozerService } from "../services/blockdozer_service";
import { blockcypherService } from "../services/blockcypher_service";
import { TransactionService } from "../services/transaction_service";
import config from "../config";

interface PubKey {
  node: {
    chain_code: string;
    depth: number;
    child_num: number;
    fingerprint: number;
    public_key: string
  }
}

interface MultiSig {
  signatures: Array<string>;
  m: number;
  pubkeys: Array<PubKey>;
}

interface Input {
  address_n?: Array<number>;
  amount?: number;
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
  inputs: Array<{
    prev_hash: string;
    prev_index: string;
    sequence: string;
    script_sig: string;
  }>;
  outputs: Array<{ amount: string; script_pubkey: string }>;
}

interface AddressTransaction {
  path: string;
}

interface CompleteTransaction {
  address: AddressTransaction;
  transaction: SimpleTransaction;
  multisig: MultiSig;
}

function isCompleteTransaction(
  transaction: SimpleTransaction | CompleteTransaction
): transaction is CompleteTransaction {
  return (<CompleteTransaction>transaction).transaction !== undefined;
}

function isSimpleTransaction(
  transaction: SimpleTransaction | CompleteTransaction
): transaction is SimpleTransaction {
  return (<SimpleTransaction>transaction).transaction_hash !== undefined;
}

interface RawTx {
  attributes: CompleteTransaction | SimpleTransaction;
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

type Bitcoin = "Bitcoin";
type Rsk = "Rsk";

type Network = Bitcoin | Rsk;

export class Transaction {
  SATOSHIS = 100000000;
  WEISTOSATOSHIS = 10000000000;

  transaction: InTransaction = { outputs: [], inputs: [], transactions: [] };

  async _addAddressFromTrezor(
    network: Network,
    _derivationPath: number[],
    coin?: string
  ): Promise<{}> {
    let derivationPath =
      JSON.stringify(_derivationPath) ===
      JSON.stringify(config._getDerivationPathTestnet())
        ? config._getDerivationPathTestnet()
        : config._getDerivationPathMainnet();

    switch (network) {
      case "Bitcoin":
        return this._addBtcAddressFromTrezor(derivationPath, coin);
    }
  }

  async _addBtcAddressFromTrezor(
    _derivationPath: number[],
    coin: string
  ): Promise<{}> {
    const btcAddress = await (<any>window).TrezorConnect.getAddress({
      path: _derivationPath,
      coin: coin
    });
    if (btcAddress.success) {
      return new Promise(resolve =>
        resolve({
          toString: () => btcAddress.payload.address,
          type: "btc"
        })
      );
    } else {
      throw new Error(btcAddress.payload.error);
    }
  }

  async calculateFee(
    _networkName: string,
    outputLength: number,
    callback: Function
  ) {
    let calculateFee = (response: { 2: string }, callback: Function) => {
      let satoshis = parseFloat(response[2]) * this.SATOSHIS;
      let fee =
        (10 + 149 * this.transaction.inputs.length + 35 * outputLength) *
        satoshis;
      callback(fee);
    };
    try {
      let response = await blockdozerService().satoshisPerByte(
        _networkName,
        false
      );
      calculateFee(response, callback);
    } catch {
      let response = await blockdozerService().satoshisPerByte(
        _networkName,
        true
      );
      calculateFee(response, callback);
    }
  }

  async createTx(
    _this: HandleParent,
    _networkName: string
  ): Promise<InTransaction> {
    let self = this;
    _.forEach(_this._rawTransaction, function(rawTx: RawTx) {
      let path = [];
      let transaction: SimpleTransaction = null;
      let multisig: MultiSig = null;
      if (rawTx.attributes === undefined) {
        return;
      }

      if (isCompleteTransaction(rawTx.attributes)) {
        if (
          rawTx.attributes.address.path &&
          rawTx.attributes.address.path.length > 0
        ) {
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

      if (_this._walletType === "/multisig_wallets") {
        self.transaction.inputs.push({
          address_n: path,
          prev_hash: transaction.transaction_hash,
          prev_index: transaction.position,
          script_type: "SPENDMULTISIG",
          multisig: multisig
        });
      } else {
        self.transaction.inputs.push({
          address_n: path,
          prev_hash: transaction.transaction_hash,
          prev_index: transaction.position
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
          };
        }),
        bin_outputs: _.map(transaction.outputs, function(output: Output) {
          return {
            amount: output.amount.toString(),
            script_pubkey: output.script_pubkey
          };
        })
      });
    });

    await self.calculateFee(
      _networkName,
      _this._outputs.length,
      (fee: number) => {
        self.transaction.outputs = _.map(_this._outputs, (output: Output) => {
          let outputResult = (<any>Object).assign({}, output);
          outputResult["amount"] = outputResult["amount"] - fee;
          return outputResult;
        });
      }
    );
    return new Promise<InTransaction>((resolve, reject) =>
      resolve(self.transaction)
    );
  }

  async signTransaction(
    original_json: any,
    coin: string
  ): Promise<SignedResponse> {
    let json = _.cloneDeep(original_json);
    loading();
    let raw_inputs = json.inputs;
    let inputs = _.map(json.trezor_inputs, (input: Input) => {
      let found_input = raw_inputs.filter((raw_input: any[]) => raw_input[1] === input['prev_hash'] && 
                                                                raw_input[2] === input['prev_index']);
      input["amount"] = found_input[0][3].toString();
      if (!input["script_type"]) {
        input["script_type"] = "SPENDADDRESS";
      }
      return input;
    });
    let outputs = _.map(json.trezor_outputs, (output: Output) => {
      let value: Output;
      value = output;
      value["amount"] = output["amount"].toString();
      return value;
    });
    const result = await (<any>window).TrezorConnect.signTransaction({ inputs, outputs, coin });
    if (result.success) {
      let signed = result.payload.serializedTx;
      let signatures = result.payload.signatures;

      let resultPk = await (<any>window).TrezorConnect.getPublicKey({ path: [] });
      if (resultPk.success) {
        for (var _i = 0; _i < json.inputs.length; _i++) {
          let input = json.inputs[_i];
          if (input.multisig) {
            let publicKey = resultPk.payload.publicKey;
            let signatureIndex = _.findIndex(
              input.multisig.pubkeys,
              (p: PubKey) => p.node.public_key == publicKey
            );

            input.multisig.signatures[signatureIndex] = signatures[_i];
          }
        }
      } else {
        return new Promise<SignedResponse>((resolve, reject) => {
          reject({
            json: resultPk.payload.error,
            done: false,
            rawtx: null
          });
        });
      }

      let done = _.every(json.inputs, (i: Input) => {
        return i.multisig
          ? _.compact(i.multisig.signatures).length >= i.multisig.m
          : true;
      });

      notLoading();
      return new Promise<SignedResponse>((resolve, reject) =>
        resolve({ json, done, rawtx: signed })
      );
    } else {
      return new Promise<SignedResponse>((resolve, reject) => {
        if (result.payload) {
          reject({ json: result.payload.error, done: false, rawtx: null });
        } else {
          reject({ json: result.message, done: false, rawtx: null });
        }
      });
    }
  }

  async getBalanceFromOutside(
    network: string,
    address: string
  ): Promise<string> {
    let balance = await blockcypherService().balance(network, address);
    return balance.final_balance;
  }

  async sendBtcTransaction(
    network: string,
    path: number[],
    to: string,
    _from: string,
    value: number
  ) {
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
    let result = await (<any>window).TrezorConnect.composeTransaction(params);
    if (result.success) {
      let signed = result.payload.serializedTx;

      config.nodeSelected = config._chooseBackUrl(network);
      return TransactionService(config).broadcast(signed);
    } else {
      throw new Error(result.payload.error);
    }
  }
}
