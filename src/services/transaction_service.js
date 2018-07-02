import {baseService} from './base_service.js'

export function transactionService() {
  return {
    broadcast (hash, successCallback, errorCallback) {
      baseService().postToNode('/transactions/broadcast', hash, successCallback, errorCallback)
    }
  }
}
