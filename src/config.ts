import * as Web3 from 'web3';
import * as net from 'net';

class Web3Provider implements Web3.Provider {
  path: string
  connection: net.Socket

  constructor(path: string) {
    this.path = path;
  }

  sendAsync(payload: Web3.JSONRPCRequestPayload, callback: (err: Error, result: Web3.JSONRPCResponsePayload) => void): void {
    // try reconnect, when connection is gone
    if(!this.connection.writable) {
      this.connection.connect({path: this.path});
    }

    this.connection.write(JSON.stringify(payload));
  }
}

class Config {
  btcNodeUrl: string = '/api/btc';
  bchNodeUrl: string = '/api/bch';
  ltcNodeUrl: string = '/api/ltc';
  rskNodeUrl: string = 'http://mycrypto.testnet.rsk.co/';
  nodeSelected: string = 'btcNodeUrl';
  rskMainNetPath: number[] = [44, 137, 0, 0, 0];
  rskTestNetPath: number[] = [44, 37310, 0, 0, 0];
  defaultPath: number[] = [44, 0, 0, 0, 0];
  defaultTestnetPath: number[] = [44, 1, 0, 0, 0];

  _derivationPaths() {
    return [{
      text: 'Bitcoin',
      id: this.defaultPath
    }, {
      text: 'Testnet',
      id: this.defaultTestnetPath
    }, {
      text: 'Rsk',
      id: this.rskMainNetPath
    }, {
      text: 'Rsk Testnet',
      id: this.rskTestNetPath
    }];
  }

  _chooseDerivationPath(_networkName: string) {
    switch(_networkName) {
      case 'bitcoin':
      case 'litecoin':
      case 'bitcoin_cash':
      case 'rsk':
        return this.defaultPath
      case 'testnet':
      case 'litecoin_testnet':
      case 'bitcoin_cash_testnet':
      case 'rsk_testnet':
        return this.defaultTestnetPath
    }
  }

  _chooseDerivationRskPath(_networkName: string) {
    switch(_networkName) {
      case 'rsk':
        return this.rskMainNetPath
      case 'rsk_testnet':
        return this.rskTestNetPath
    }
  }

  _chooseBackUrl(_networkName: string) {
    switch(_networkName) {
      case 'rsk':
      case 'rsk_testnet':
        return 'rskNodeUrl'
      case 'bitcoin':
      case 'testnet':
        return 'btcNodeUrl'
      case 'litecoin':
      case 'litecoin_testnet':
        return 'ltcNodeUrl'
      case 'bitcoin_cash':
      case 'bitcoin_cash_testnet':
        return 'bchNodeUrl'
    }
  }

  _getUrlRskNode(_networkName: string): Web3.Provider {
    switch(_networkName) {
      case 'rsk':
      case 'bitcoin':
      case 'litecoin':
      case 'bitcoin_cash':
        return new Web3Provider('https://public-node.rsk.co/')
      case 'rsk_testnet':
      case 'testnet':
      case 'litecoin_testnet':
      case 'bitcoin_cash_testnet':
        return new Web3Provider('http://mycrypto.testnet.rsk.co/')
    }
  }

  _getRskChainId(_networkName: string) {
    switch(_networkName) {
      case 'rsk':
        return 30
      case 'rsk_testnet':
        return 31
    }
  }
}

let config = new Config()
export default config
