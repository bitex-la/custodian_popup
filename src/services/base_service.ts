type Config = { [index: string] : string };

class BaseService {

  config: Config

  constructor(config: Config) {
    this.config = config
  }

  postToNode (url: string, data: any, successCallback: () => void, errorCallback: () => void) {
    return (<any> window).jQuery.ajax({
      method: 'POST',
      url: this.config[this.config.nodeSelected] + url,
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),
      success: successCallback,
      error: errorCallback
    });
  }

  listFromNode<T> (url: string): Promise<T> {
    return this.getMethod(this.config[this.config.nodeSelected] + url);
  }

  getMethod<T> (url: string): Promise<T> {
    return (<any> window).jQuery.ajax({
      method: 'GET',
      url: url,
      contentType: 'application/json; charset=utf-8'
    });
  }
}

export function baseService (config: Config) {
  return new BaseService(config);
}
