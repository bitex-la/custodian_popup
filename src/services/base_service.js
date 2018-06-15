export function baseService() {
  return {
    postToNode (url, data, success_callback, error_callback) {
      return jQuery.ajax({
        method: 'POST',
        url: nodeUrl + url,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        crossDomain: true,
        success: success_callback,
        error: error_callback
      })
    }
  }
}
