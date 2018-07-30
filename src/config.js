function Config(defaultServer) {
  return {
    btcNodeUrl: 'http://localhost:9100',
    bchNodeUrl: 'http://localhost:9200',
    ltcNodeUrl: 'http://localhost:9300',
    rskNodeUrl: 'http://localhost:4444',
    nodeSelected: 'btcNodeUrl',
    rskMainNetPath: [44, 137, 0, 0, 0],
    rskTestNetPath: [44, 37310, 0, 0, 0],
    _chooseBackUrl(_networkName) {
      switch(_networkName) {
        case 'testnet':
          return 'btcNodeUrl'
        case 'litecoin':
          return 'ltcNodeUrl'
          break
        case 'bitcoin_cash_testnet':
          return 'bchNodeUrl'
          break
      }
    }
  }
}

let config = new Config()
export default config
