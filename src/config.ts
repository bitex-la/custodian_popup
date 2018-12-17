type DerivationPath = { text: string, id: number[] };
export class Config {

  btcNodeUrl: string = '/api/btc';
  bchNodeUrl: string = '/api/bch';
  ltcNodeUrl: string = '/api/ltc';
  rskNodeUrl: string = '';
  nodeSelected: string = 'btcNodeUrl';
  rskMainNetPath: number[] = [44, 137, 0, 0, 0];
  rskTestNetPath: number[] = [44, 37310, 0, 0, 0];
  defaultPath: number[] = [(44 | 0x80000000) >>> 0,
                           (0 | 0x80000000) >>> 0,
                           (0 | 0x80000000) >>> 0, 0, 0];
  defaultTestnetPath: number[] = [(44 | 0x80000000) >>> 0,
                                  (1 | 0x80000000) >>> 0,
                                  (0 | 0x80000000) >>> 0, 0, 0];
  defaultLiteCoinPath: number[] = [(49 | 0x80000000) >>> 0,
                                   (2 | 0x80000000) >>> 0,
                                   (0 | 0x80000000) >>> 0, 0, 0];
  defaultBCashPath: number[] = [(44 | 0x80000000) >>> 0,
                                (145 | 0x80000000) >>> 0,
                                (0 | 0x80000000) >>> 0, 0, 0];
  defaultBgoldPath: number[] = [(49 | 0x80000000) >>> 0,
                                (156 | 0x80000000) >>> 0,
                                (0 | 0x80000000) >>> 0, 0, 0];
  defaultSegwitPath: number[] = [49, 0, 0, 0, 0];
  defaultSegwitTestnetPath: number[] = [49, 1, 0, 0, 0];
  storage = window.localStorage;

  _setRskTestnetNodeUrl(url: string) {
    this.storage.setItem('rskTestnetNodeUrl', url);
  }

  _setRskMainnetNodeUrl(url: string) {
    this.storage.setItem('rskMainnetNodeUrl', url);
  }

  _getRskMainnetNodeUrl(): string {
    return this.storage.getItem('rskMainnetNodeUrl') || 'https://public-node.rsk.co/';
  }

  _getRskTestnetNodeUrl(): string {
    return this.storage.getItem('rskTestnetNodeUrl') || 'https://mycrypto.testnet.rsk.co/';
  }

  _setDerivationPathMainnet(path: number[]) {
    this.storage.setItem('derivationPathMainnet', JSON.stringify(path));
  }

  _setDerivationPathTestnet(path: number[]) {
    this.storage.setItem('derivationPathTestnet', JSON.stringify(path));
  }

  _getDerivationPathMainnet(): number[] {
    return JSON.parse(this.storage.getItem('derivationPathMainnet')) || this.defaultPath;
  }

  _getDerivationPathTestnet(): number[] {
    return JSON.parse(this.storage.getItem('derivationPathTestnet')) || this.defaultTestnetPath;
  }

  _derivationPaths() : DerivationPath[] {
    return [{
      text: "Bitcoin m/44'/0'/0'/0'/0",
      id: this.defaultPath
    }, {
      text: "Testnet m/44'/1'/0'/0'/0",
      id: this.defaultTestnetPath
    }, {
      text: "Bitcoin Segwit m/49'/0'/0'/0'/0",
      id: this.defaultSegwitPath
    }, {
      text: "Testnet Segwit m/49'/1'/0'/0'/0",
      id: this.defaultSegwitTestnetPath
    }, {
      text: "Rsk m/44'/137'/0'/0'/0",
      id: this.rskMainNetPath
    }, {
      text: "Rsk Testnet m/44'/37310'/0'/0'/0",
      id: this.rskTestNetPath
    }, {
      text: "Custom",
      id: []
    }];
  }

  _chooseDerivationPath(_networkName: string) {
    switch(_networkName) {
      case 'Bitcoin':
        return this.defaultPath;
      case 'Litecoin':
        return this.defaultLiteCoinPath;
      case 'Bcash':
        return this.defaultBCashPath;
      case 'Testnet':
        return this.defaultTestnetPath;
      case 'Bgold':
        return this.defaultBgoldPath;
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
      case 'Bitcoin':
      case 'Testnet':
        return 'btcNodeUrl'
      case 'litecoin':
      case 'litecoin_testnet':
        return 'ltcNodeUrl'
      case 'Bcash':
      case 'bitcoin_cash_testnet':
        return 'bchNodeUrl'
    }
  }

  _getUrlRskNode(_networkName: string): string {
    switch(_networkName) {
      case 'Testnet':
        return this._getRskTestnetNodeUrl();
      default:
        return this._getRskMainnetNodeUrl();
    }
  }

  _getRskChainId(_networkName: string) {
    switch(_networkName) {
      case 'Mainnet':
        return 30
      case 'Testnet':
        return 31
    }
  }
}

let config = new Config();
export default config;
