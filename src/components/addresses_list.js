import _ from 'lodash'
import { hamlism } from '../lib/hamlism'
import { buttonismWithSize } from '../lib/bootstrapism'
import { showError } from '../messages'
import { walletService } from '../services/wallet_service.js'

import config from '../config'

export function addressesList () {
  return {
    $tag: 'table.table.addresses-table',
    style: 'display: none',
    $update () {
      this.style = `display: ${this._displayAddresses}`
    },
    $$: [
      {
        $tag: 'thead',
        $$: [{
          $tag: 'tr',
          $$: [
            {
              $tag: 'th',
              $text: 'Address'
            },
            {
              $tag: 'th',
              $text: 'Balance'
            },
            {
              $tag: 'th',
              $text: 'Actions'
            }
          ]
        }]
      },
      {
        $tag: 'tbody',
        _fillAddress (address) {
          return {
            $tag: 'tr',
            $virus: hamlism,
            $$: [
              { $tag: 'td', $text: Object.keys(address)[0] },
              { $tag: 'td', $text: Object.values(address)[0] },
              {
                $tag: 'td',
                $$: [{
                  $virus: buttonismWithSize('Create Transaction', 'primary', 'block'),
                  'data-id': 'create-address-transaction',
                  'data-toggle': 'modal',
                  'data-target': '#modalDialogTx',
                  onclick () {
                    let self = this
                    self._resourceType = 'address'

                    let url = `/plain_wallets/relationships/addresses/${Object.keys(address)[0]}/get_utxos?since=0&limit=1000000`
                    walletService(config).list(url, (successData) => {
                      document.querySelector('#wallets')._rawTransaction = successData.data
                      let totalAmount = _.sum(_.map(successData.data, (utxo) => utxo.attributes.satoshis))
                      document.querySelector('#modalDialogTx')._totalAmount = totalAmount
                      document.querySelector('#modalDialogTx')._updateAmount()
                    }, (errorData) => showError(errorData))
                  }
                }]
              }
            ]
          }
        },
        $update () {
          this.innerHTML = ''
          _.each(this._addresses, (a) => this.$build(this._fillAddress(a)))
        }
      }
    ]
  }
}
