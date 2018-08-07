import {baseService} from './base_service.js'

export function blockcypherService(_networkName) {

  return {
    _getExternalApi (_networkName) {
      switch(_networkName) {
        case 'bitcoin':
          return 'https://api.blockcypher.com/v1/btc/main'
        case 'testnet':
          return 'https://api.blockcypher.com/v1/btc/test3'
        case 'litecoin':
          return 'https://api.blockcypher.com/v1/ltc/main'
        case 'litecoin_testnet':
        case 'bitcoin_cash':
        case 'bitcoin_cash_testnet':
          return ''
      }
    },
    balance (_networkName, address) {
      return jQuery.ajax({
        method: 'GET',
        url: `${this._getExternalApi(_networkName)}/addrs/${address}/balance`
      })
    }
  }
}
