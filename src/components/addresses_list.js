import _ from 'lodash'
import { hamlism } from '../lib/hamlism'

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
              { $tag: 'td', $text: Object.values(address)[0] }
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
