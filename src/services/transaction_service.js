import {baseService} from './base_service.js'

export function transactionService(config) {
  return {
    broadcast (hash, successCallback, errorCallback) {
      return jQuery.ajax({
        method: 'POST',
        url: `${config[config.nodeSelected]}/transactions/broadcast`,
        contentType: 'application/json; charset=utf-8',
        data: hash,
        crossDomain: true,
        success: successCallback,
        error: errorCallback
      })
    }
  }
}
