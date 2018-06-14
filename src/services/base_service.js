export function baseService() {
  return {
    postToNode (url, data, success_callback, error_callback) {
      return jQuery.ajax({
        method: 'POST',
        url: nodeUrl + url,
        contentType: 'application/json; charset=utf-8',
        data: data,
        crossDomain: true,
        data: data,
        dataType: "json",
        success: success_callback,
        error: error_callback
      })
    }
  }
}
