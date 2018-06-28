import {hamlism} from '../lib/hamlism.js'

export function addressesList() {
  return {
    $tag: 'table.table.addresses-table',
    style: 'display: none',
    $update () {
      this.style = `display: ${this._displayAddresses}`
    },
    $$: [
      {
        $tag: 'thead',
        $$: [ { $tag: 'tr', $$: [ { $tag: 'th', $text: 'Address' } ] } ]
      },
      {
        $tag: 'tbody',
        _fillAddress(address) {
          let self = this
          return {
            $tag: 'tr',
            $virus: hamlism,
            $$: [ { $tag: 'td', $text: address } ]
          }
        },
        $update() {
          this.innerHTML = ''
          _.each(this._addresses, (a) => this.$build(this._fillAddress(a)))
        }
      }
    ]
  }
}
