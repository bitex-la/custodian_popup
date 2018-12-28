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

export interface Output {
  script_type?: string;
  address: string;
  amount: string;
  script_pubkey?: string;
}

export interface TrezorTransaction {
  trezor_outputs: Array<Output>;
  trezor_inputs: Array<Input>;
}

interface TransactionResponse {
  address: string;
  block_height: number;
  transaction_hash: string;
  position: number;
  version: number;
  locktime: number;
  is_spent: boolean;
  inputs: Input[];
  outputs: Output[];
}

interface WalletDetail {
  _walletType: string;
  _walletId: string;
}

interface JsonApiUtxo {
  attributes: {
    transaction: TransactionResponse
  },
  id: string,
  relationships: {
    address: {
      data: {
        id: string,
        type: string
      }
    }
  },
  type: string
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

  transaction: TrezorTransaction = { trezor_outputs: [], trezor_inputs: [] };

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
        (10 + 149 * this.transaction.trezor_inputs.length + 35 * outputLength) *
        satoshis;
      callback(fee);
    };
    let response = await blockdozerService().satoshisPerByte(
      _networkName,
      true
    );
    calculateFee(response, callback);
  }

  pathConstruction (networkName: string): number[] {
    return config._chooseDerivationPath(networkName);
  }

  async createTx(
    walletDetail: WalletDetail,
    _networkName: string,
    outputs: Output[]
  ): Promise<TrezorTransaction> {
    let self = this;
    let transaction = TransactionService(config);
    let utxos = await transaction.getUtxos(walletDetail._walletType, walletDetail._walletId);
    let trezorTransaction: TrezorTransaction = {
      trezor_inputs: [],
      trezor_outputs: []
    };

    _.forEach(utxos.data, function(utxo: JsonApiUtxo) {
      if (utxo.attributes === undefined) {
        return;
      }

      let input: Input = {
        prev_hash: utxo.attributes.transaction.transaction_hash,
        prev_index: utxo.attributes.transaction.position.toString(),
        address_n: self.pathConstruction(_networkName)
      };
      trezorTransaction.trezor_inputs.push(input)
    });
    _.forEach(outputs, (output: Output) => trezorTransaction.trezor_outputs.push(output));

    await self.calculateFee(
      _networkName,
      outputs.length,
      (fee: number) => {
        self.transaction.trezor_outputs = _.map(outputs, (output: Output) => {
          let outputResult = (<any>Object).assign({}, output);
          outputResult["amount"] = outputResult["amount"] - fee;
          return outputResult;
        });
      }
    );
    return new Promise<TrezorTransaction>((resolve, reject) =>
      resolve(trezorTransaction)
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
