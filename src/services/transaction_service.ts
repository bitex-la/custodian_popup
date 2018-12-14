import { Config } from '../config';

export function TransactionService (config: Config) {
  return {
    broadcast (hash: string) {
      return (<any> window).$.ajax({
        method: 'POST',
        url: `${(<any> config)[config.nodeSelected]}/transactions/broadcast`,
        contentType: 'application/json; charset=utf-8',
        data: hash,
        crossDomain: true
      })
    }
  }
}
