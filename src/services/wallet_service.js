import {baseService} from './base_service.js'

export function walletService() {
  return {
    list (wallet_type, success_callback, error_callback) {
      baseService().listFromNode(wallet_type).done(success_callback).fail(error_callback)
    },
    create (wallet_type, data, success_callback, error_callback) {
      baseService().postToNode(wallet_type, data).done(success_callback).fail(error_callback)
    }
  }
}
