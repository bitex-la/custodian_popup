export function baseService (config: { [index: string] : string }) {
  return {
    postToNode (url: string, data: any, successCallback: () => void, errorCallback: () => void) {
      return (<any> window).jQuery.ajax({
        method: 'POST',
        url: config[config.nodeSelected] + url,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        success: successCallback,
        error: errorCallback
      })
    },
    listFromNode (url: string, successCallback: () => void, errorCallback: () => void) {
      return this.getMethod(config[config.nodeSelected] + url, successCallback, errorCallback)
    },
    getMethod (url: string, successCallback: () => void, errorCallback: () => void) {
      return (<any> window).jQuery.ajax({
        method: 'GET',
        url: url,
        contentType: 'application/json; charset=utf-8',
        success: successCallback,
        error: errorCallback
      })
    }
  }
}
