import { baseService } from './base_service'

export function WalletService (config) {
  return {
    list (url, successCallback, errorCallback) {
      return new Promise(
        resolve => {
          return resolve(baseService(config)
            .listFromNode(url)
            .done(successCallback)
            .fail(errorCallback))
        }
      )
    },
    create (url, data, successCallback, errorCallback) {
      baseService(config).postToNode(url, data).done(successCallback).fail(errorCallback)
    }
  }
}
