import { Config } from '../config';

class BaseService {

  config: Config

  constructor(config: Config) {
    this.config = config
  }

  postToNode (url: string, data: any) {
    return (<any> window).jQuery.ajax({
      method: 'POST',
      url: (<any> this.config)[this.config.nodeSelected] + url,
      data: JSON.stringify(data)
    });
  }

  listFromNode<T> (url: string): Promise<T> {
    return this.getMethod((<any> this.config)[this.config.nodeSelected] + url);
  }

  getMethod<T> (url: string): Promise<T> {
    return (<any> window).jQuery.ajax({
      method: 'GET',
      url: url
    });
  }
}

export function baseService (config: Config) {
  return new BaseService(config);
}
