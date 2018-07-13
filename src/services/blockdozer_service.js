import {baseService} from './base_service.js'

export function blockdozerService() {
  return {
    satoshisPerByte (network, success_callback, error_callback) {
      return jQuery.ajax({
        method: 'GET',
        url: `${this.chooseRootUrl(network)}/api/utils/estimatefee`
      })
    },
    chooseRootUrl (network) {
      switch (network) {
        case 'bitcoin':
          return 'https://btc.blockdozer.com'
        case 'testnet':
          return 'https://tbtc.blockdozer.com'
        case 'bcash':
          return 'https://bch.blockdozer.com'
        case 'bcashtestnet':
          return 'https://tbch.blockdozer.com'
      }
    }
  }
}
