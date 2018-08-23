export function baseService (config) {
  return {
    postToNode (url, data, successCallback, errorCallback) {
      return window.jQuery.ajax({
        method: 'POST',
        url: config[config.nodeSelected] + url,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        success: successCallback,
        error: errorCallback
      })
    },
    listFromNode (url, successCallback, errorCallback) {
      return this.getMethod(config[config.nodeSelected] + url, successCallback, errorCallback)
    },
    getMethod (url, successCallback, errorCallback) {
      return window.jQuery.ajax({
        method: 'GET',
        url: url,
        contentType: 'application/json; charset=utf-8',
        success: successCallback,
        error: errorCallback
      })
    }
  }
}
