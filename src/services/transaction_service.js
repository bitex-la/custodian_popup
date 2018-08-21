export function TransactionService (config) {
  return {
    broadcast (hash, successCallback, errorCallback) {
      return window.$.ajax({
        method: 'POST',
        url: `${config[config.nodeSelected]}/transactions/broadcast`,
        contentType: 'application/json; charset=utf-8',
        data: hash,
        crossDomain: true,
        success: successCallback,
        error: errorCallback
      })
    },
    balance (address) {
      return window.$.ajax({
        method: 'GET',
        url: `${config[config.nodeSelected]}/plain_wallets/relationships/addresses/${address}/balance?since=0&limit=10000`,
        contentType: 'application/json; charset=utf-8'
      })
    }
  }
}
