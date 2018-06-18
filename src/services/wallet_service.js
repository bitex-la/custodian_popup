import {baseService} from './base_service.js'

export function walletService() {
  return {
    list (url, success_callback, error_callback) {
      baseService().listFromNode(url).done(success_callback).fail(error_callback)
    },
    create (url, data, success_callback, error_callback) {
      baseService().postToNode(url, data).done(success_callback).fail(error_callback)
    }
  }
}
