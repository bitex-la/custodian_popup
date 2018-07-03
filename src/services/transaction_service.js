import {baseService} from './base_service.js'

export function transactionService() {
  return {
    broadcast (hash, successCallback, errorCallback) {
      jQuery.ajax({
        method: 'POST',
        url: `${nodeUrl}/transactions/broadcast`,
        contentType: 'application/json; charset=utf-8',
        data: hash,
        crossDomain: true,
        success: successCallback,
        error: errorCallback
      })
    }
  }
}
