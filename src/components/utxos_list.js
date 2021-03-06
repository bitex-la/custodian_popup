import { hamlism } from '../lib/hamlism'
import { buttonismWithSize } from '../lib/bootstrapism'

export function utxosList () {
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
            }, {
              $tag: 'th',
              $text: 'Previous Hash'
            }, {
              $tag: 'th',
              $text: 'Previous Index'
            }]
          }]
        }, {
          $tag: 'tbody',
          _fillUtxos (utxo) {
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
          $update () {
            this.innerHTML = ''
            window._.each(this._utxos, (utxo) => this.$build(this._fillUtxos(utxo)))
          }
        }]
      }, {
        $virus: buttonismWithSize('Create Transaction', 'primary', 'block'),
        'data-id': 'create-transaction',
        'data-toggle': 'modal',
        'data-target': '#modalDialogTx',
        onclick () {
          document.querySelector('#modalDialogTx')._totalAmount = window._.sum(window._.map(this._utxos, (utxo) => parseFloat(utxo.amount)))
          document.querySelector('#modalDialogTx')._updateAmount()
        }
      }]
    }]
  }
}
