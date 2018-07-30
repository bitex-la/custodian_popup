export function baseService(config) {
  return {
    postToNode (url, data, success_callback, error_callback) {
      return jQuery.ajax({
        method: 'POST',
        url: config[config.nodeSelected] + url,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        crossDomain: true,
        success: success_callback,
        error: error_callback
      })
    },
    listFromNode (url, success_callback, error_callback) {
      return this.getMethod(config[config.nodeSelected] + url, success_callback, error_callback)
    },
    getMethod (url, success_callback, error_callback) {
      return jQuery.ajax({
        method: 'GET',
        url: url,
        contentType: 'application/json; charset=utf-8',
        crossDomain: true,
        success: success_callback,
        error: error_callback
      })
    }
  }
}
