import { baseService } from './base_service'

export function walletService (config) {
  return {
    list (url, successCallback, errorCallback) {
      baseService(config).listFromNode(url).done(successCallback).fail(errorCallback)
    },
    create (url, data, successCallback, errorCallback) {
      baseService(config).postToNode(url, data).done(successCallback).fail(errorCallback)
    }
  }
}
