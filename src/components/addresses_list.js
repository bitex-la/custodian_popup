import { hamlism } from '../lib/hamlism.js'
import { buttonismWithSize } from '../lib/bootstrapism.js'

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
                  'data-id': 'create-transaction',
                  'data-toggle': 'modal',
                  'data-target': '#modalDialogTx',
                  onclick () {
                    document.querySelector('#modalDialogTx')._totalAmount = Object.values(address)[0]
                    document.querySelector('#modalDialogTx')._updateAmount()
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
