import { baseService } from './base_service';
import { Config } from '../config';

export function WalletService (config: Config) {
  return {
    list (url: string): Promise<{ data: { } }> {
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
