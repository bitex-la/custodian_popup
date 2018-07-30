import {baseService} from './base_service.js'

export function walletService(config) {
  return {
    list (url, success_callback, error_callback) {
      baseService(config).listFromNode(url).done(success_callback).fail(error_callback)
    },
    create (url, data, success_callback, error_callback) {
      baseService(config).postToNode(url, data).done(success_callback).fail(error_callback)
    }
  }
}
