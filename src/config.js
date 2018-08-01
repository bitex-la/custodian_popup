function Config(defaultServer) {
  return {
    btcNodeUrl: 'http://localhost:9100',
    bchNodeUrl: 'http://localhost:9200',
    ltcNodeUrl: 'http://localhost:9300',
    rskNodeUrl: 'http://localhost:4444',
    nodeSelected: 'btcNodeUrl',
    rskMainNetPath: [44, 137, 0, 0, 0],
    rskTestNetPath: [44, 37310, 0, 0, 0],
    defaultPath: [44, 0, 0, 0, 0],
    defaultTestnetPath: [44, 1, 0, 0, 0],
    _chooseDerivationPath(_networkName) {
      switch(_networkName) {
        case 'rsk':
          return this.rskMainNetPath
        case 'rsk_testnet':
          return this.rskTestNetPath
        case 'bitcoin':
        case 'litecoin':
        case 'bitcoin_cash':
          return this.defaultPath
        case 'testnet':
        case 'litecoin_testnet':
        case 'bitcoin_cash_testnet':
          return this.defaultTestnetPath
      }
    },
    _chooseBackUrl(_networkName) {
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
          break
        case 'bitcoin_cash':
        case 'bitcoin_cash_testnet':
          return 'bchNodeUrl'
          break
      }
    }
  }
}

let config = new Config()
export default config
