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

  _getUrlRskNode(_networkName: string) {
    switch(_networkName) {
      case 'rsk':
      case 'bitcoin':
      case 'litecoin':
      case 'bitcoin_cash':
        return 'https://public-node.rsk.co/'
      case 'rsk_testnet':
      case 'testnet':
      case 'litecoin_testnet':
      case 'bitcoin_cash_testnet':
        return 'http://mycrypto.testnet.rsk.co/'
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
