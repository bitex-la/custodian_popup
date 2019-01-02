import { baseService } from './base_service';
import { Config } from '../config';

export interface JsonApiAddress {
  data: [{
    attributes: {
      public_address: string,
      path: string,
      balance: number
    }
  }]
}

export function AddressService (config: Config) {
  return {
    list (url: string): Promise<JsonApiAddress> {
      return new Promise(
        resolve => {
          return resolve(baseService(config)
            .listFromNode(url))
        }
      );
    },
    create (url: string, data: any) {
      return baseService(config).postToNode(url, data);
    }
  }
}
