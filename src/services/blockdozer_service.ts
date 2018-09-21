export function blockdozerService () {
  return {
    satoshisPerByte (network: string, defaultUrl: boolean) {
      if (defaultUrl) {
        return (<any> window).jQuery.ajax({
          method: 'GET',
          url: 'https://blockdozer.com/api/utils/estimatefee'
        })
      } else {
        return (<any> window).jQuery.ajax({
          method: 'GET',
          url: `${this.chooseRootUrl(network)}/api/utils/estimatefee`
        })
      }
    },
    chooseRootUrl (network: string) {
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
