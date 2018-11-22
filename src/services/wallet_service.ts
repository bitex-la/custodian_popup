import { baseService } from './base_service';
import { Config } from '../config';

interface JsonApiWallet {
  data: [{
    attributes: {
      balance: number,
      label: string
    }
  }]
}

export function WalletService (config: Config) {
  return {
    list (url: string): Promise<JsonApiWallet> {
      return new Promise(
        resolve => {
          return resolve(baseService(config)
            .listFromNode(url))
        }
      );
    },
    create (url: string, data: string) {
      return baseService(config).postToNode(url, data);
    }
  }
}
