import {hamlism} from '../lib/hamlism.js'
import {buttonism_with_size} from '../lib/bootstrapism.js'

export function utxosList() {
  return {
    $tag: 'card.utxos-list',
    style: 'display: none',
    $update () {
      this.style = `display: ${this._displayUtxos}`
    },
    $$: [{
      $tag: '.card-body',
      $$: [{
        $tag: 'table.table.utxos-table',
        $$: [{
          $tag: 'thead',
          $$: [{
            $tag: 'tr',
            $$: [{
              $tag: 'th',
              $text: 'Amount'
            },{
              $tag: 'th',
              $text: 'Previous Hash'
            },{
              $tag: 'th',
              $text: 'Previous Index'
            }]
          }]
        }, {
          $tag: 'tbody',
          _fillUtxos(utxo) {
            let self = this
            return {
              $tag: 'tr',
              $virus: hamlism,
              $$: [{
                $tag: 'td',
                $text: utxo.amount
              }, {
                $tag: 'td',
                $text: utxo.prev_hash
              }, {
                $tag: 'td',
                $text: utxo.prev_index
              }]
            }
          },
          $update() {
            this.innerHTML = ''
            _.each(this._utxos, (utxo) => this.$build(this._fillUtxos(utxo)))
          }
        }]
      }, {
        $virus: buttonism_with_size('Create Transaction', 'primary', 'block'),
        onclick() {
          console.log('constructTransaction')
        }
      }]
    }]
  }
}
