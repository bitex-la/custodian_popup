import * as bowser from 'bowser';
import * as bitcoin from 'bitcoinjs-lib';
import * as hd from 'hd-wallet';
import {pinHandler} from './pin_handler.js';
import {passphraseHandler, blankPassphraseHandler} from './passphrase_handler.js';
import {showError, loading, notLoading} from './messages.js'
import * as trezor from 'trezor.js';
(<any>window).$trezor = trezor;
var semvercmp = require('semver-compare');
var bip44 = require('bip44-constants')

const CONFIG_URL = './config_signed.bin';

export function run(callback: any, omitPass: any = {}){
  return initDevice(omitPass)
    .then(callback)
    .catch((error) => {
      showError(error)
      console.log('Error caught:', error)
    })
}

function initDevice(omitPass: any = {}): Promise<any> {
  return initTransport()
    .then((t) => resolveAfter(500, t))
    .then((t) => waitForFirstDevice(t))
    .then((device) => {
      device.session.on('pin', pinHandler)
      device.session.on('button', makeButtonCallback(device))
      device.session.on('passphrase',
        omitPass ? blankPassphraseHandler : passphraseHandler)

      return device;
    });
}

function makeButtonCallback(device: Device){
  return function callback(code: string) {
    let receive = () => {
      device.session.removeListener('receive', receive)
      device.session.removeListener('error', receive)
    };

    device.session.on('receive', receive)
    device.session.on('error', receive)

    switch (code) {
    case 'ButtonRequest_ConfirmOutput':
    case 'ButtonRequest_SignTx':
      console.log("Should be showing #alert_confirm_tx")
      break;
    default:
      console.log("Should be showing #alert_confirm")
      break;
    }
  }
}

type MessageResponse<T> = {
    type: string;
    message: T;
};

type HDPubNode = {
    depth: number;
    fingerprint: number;
    child_num: number;
    chain_code: string;
    public_key: string;
};

type PublicKey = {
    node: HDPubNode;
    xpub: string;
};

type SignedTx = {
    serialized: {
        signatures: Array<string>;
        serialized_tx: string;
    }
};

type EthereumSignature = {
  v: number,
  r: string,
  s: string,
};

interface Session {
    getPublicKey: (address_n: Array<number>, coin?: string) => Promise<MessageResponse<PublicKey>>;
    signTx(
        inputs: Array<trezor.TransactionInput>,
        outputs: Array<trezor.TransactionOutput>,
        txs: Array<trezor.RefTransaction>,
        coin: string,
        locktime?: number,
        overwinter?: boolean,
    ): Promise<MessageResponse<SignedTx>>;

    signEthTx(
        address_n: Array<number>,
        nonce: string,
        gas_price: string,
        gas_limit: string,
        to: string,
        value: string,
        data?: string,
        chain_id?: number
    ): Promise<EthereumSignature>;

    removeListener(name: string, event: Function): Function;
    on(name: string, event: Function): Function;
};

interface Feature {
  bootloader_mode: string;
  initialized: string;
  major_version: number;
  minor_version: number;
  patch_version: number;
  coins: Array<{ coin_name: string }>;
};

export class Device {
  session: Session;
  features: Feature;

  constructor(session: Session, device: Device) {
    this.session = session;
    this.features = device.features;
  }

  isBootloader() {
    return this.features.bootloader_mode;
  }

  isInitialized() {
    return this.features.initialized;
  }

  getVersion() {
    return [
      this.features.major_version,
      this.features.minor_version,
      this.features.patch_version
    ].join('.');
  }

  atLeast(version: string) {
    return semvercmp(this.getVersion(), version) >= 0;
  }

  getCoin(name: string) {
    let coins = this.features.coins;
    for (let i = 0; i < coins.length; i++) {
      if (coins[i].coin_name === name) {
        return coins[i];
      }
    }
    throw new Error('Device does not support given coin type');
  }

  getNode(path: Array<number>) {
    return this.session.getPublicKey(path)
      .then(({message}) => bitcoin.HDNode.fromBase58(message.xpub));
  }
}

const NO_TRANSPORT = new Error('No trezor.js transport is available');
const NO_CONNECTED_DEVICES = new Error('No connected devices');
const DEVICE_IS_BOOTLOADER = new Error('Connected device is in bootloader mode');
const DEVICE_IS_EMPTY = new Error('Connected device is not initialized');
const FIRMWARE_IS_OLD = new Error('Firmware of connected device is too old');

function errorHandler(retry: Promise<any>) {
  return (error: Error) => {
    const never = ()  => new Promise(() => {});

    switch (error) { // application errors
      case NO_TRANSPORT:
        showError("Transport is missing")
        return never

      case DEVICE_IS_EMPTY:
        showError("Device is empty")
        return never

      case FIRMWARE_IS_OLD:
        showError("Firmware is too old")
        return never

      case NO_CONNECTED_DEVICES:
        showError("No connected devices")
        return resolveAfter(500, null).then(retry)

      case DEVICE_IS_BOOTLOADER:
        showError("Your device is in bootloader mode")
        return resolveAfter(500, null).then(retry)
    }

    switch (error.code) { // 'Failure' messages
      case 'Failure_PinInvalid':
        showError("Pin was invalid")
        return resolveAfter(2500, null).then(retry)
    }

    throw error
  };
}

function initTransport() {
    let timestamp = new Date().getTime();
    let configUrl = CONFIG_URL + '?' + timestamp;

    let result = new Promise((resolve, reject) => {
      let list = new window.$trezor.DeviceList({configUrl});
      let onError;
      let onTransport = () => {
        list.removeListener('error', onError);
        resolve(list);
      };
      onError = () => {
        list.removeListener('transport', onTransport);
        reject(NO_TRANSPORT);
      };
      list.on('error', onError);
      list.on('transport', onTransport);
    });

    return result.catch(errorHandler());
}

// note - this can be changed in onMessage
// caller can specify his own version
// but only bigger than 1.3.4
let requiredFirmware = '1.3.4';

function parseRequiredFirmware(firmware) {
  if (firmware == null) {
    return
  }

  try {
    let firmwareString = '';
    if (typeof firmware === 'string') {
      firmwareString = firmware;
    } else {
      // this can cause an exception, but we run this in try anyway
      firmwareString = firmware.map((n) => n.toString()).join('.');
    }

    const split = firmwareString.split('.');
    if (split.length !== 3) {
      throw new Error('Too long version');
    }
    if (!(split[0].match(/^\d+$/)) || !(split[1].match(/^\d+$/)) || !(split[2].match(/^\d+$/))) {
      throw new Error('Version not valid');
    }

    if (semvercmp(firmwareString, requiredFirmware) >= 0) {
      requiredFirmware = firmwareString;
    }
  } catch (e) {
    // print error, but otherwise ignore
    console.error(e);
  }
}

function waitForFirstDevice(list) {
  let res;
  if (!(list.hasDeviceOrUnacquiredDevice())) {
    res = Promise.reject(NO_CONNECTED_DEVICES);
  } else {
    res = list.acquireFirstDevice(true)
      .then(({device, session}) => new Device(session, device))
      .then((device) => {
        if (device.isBootloader()) {
          throw DEVICE_IS_BOOTLOADER;
        }
        /*if (!device.isInitialized()) {
          throw DEVICE_IS_EMPTY;
        }*/
        if (!device.atLeast(requiredFirmware)) {
          // 1.3.0 introduced HDNodeType.xpub field
          // 1.3.4 has version2 of SignIdentity algorithm
          throw FIRMWARE_IS_OLD;
        }
        return device;
      })
  }

  return res.catch(errorHandler(() => waitForFirstDevice(list)));
}

function resolveAfter(msec: number, value: Transport) {
    return new Promise((resolve) => {
        setTimeout(resolve, msec, value);
    });
}
