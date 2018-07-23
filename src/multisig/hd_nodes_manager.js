import * as device from '../device.js'
import { buttonism, buttonismWithSize, selectGroupism, formGroupism } from '../lib/bootstrapism.js'
import { hamlism } from '../lib/hamlism.js'
import { showError, loading, notLoading } from '../messages.js'
import { custodianManager } from '../services/custodian_manager.js'

export function hdNodesManager (){
  return {
    class: "well well-sm",
    _path: [],
    _setPath: function(string){
      this._path = string ? bip32.fromString(string).toPathArray() : []
    },
    _xpub: '',
    _hdNodeFromTrezor(){
      let self = this
      let networkName = this._networkName;
      loading()
      device.run((d) => {

        let _path = this._path
        switch(networkName) {
          case 'rsk':
            return d.session.ethereumGetAddress([44, 137, 0, 0, 0])
              .then((result) => {
                this._addEthAddress(result)
              })
            break
          case 'rsk_testnet':
            return d.session.ethereumGetAddress([44, 37310, 0, 0, 0])
              .then((result) => {
                this._addEthAddress(result)
              })

            break
          default:
            return d.session.getPublicKey(_path, networkName)
              .then((result) => {
                this._addHdNodeFromXpub(result.message.xpub)
                notLoading()
              })
            break
        }
      })
    },
    _addHdNodeFromXpub(xpub) {
      this._hdNodes.push(bitcoin.HDNode.fromBase58(xpub, this._network()))
    },
    _hdNodeContainer(hdNode) {
      let self = this
      return {
        $virus: hamlism,
        $tag: 'li.list-group-item',
        $$: [
          { $tag: 'button.close',
            $text: '×',
            onclick(e){ self._hdNodes = _.without(self._hdNodes, hdNode) }
          },
          { $tag: 'p span', $text: hdNode.getAddress() },
          { $tag: 'input.form-control.form-control-sm',
            value: hdNode.neutered().toBase58(),
            readonly: true
          },
          {
            $virus: hamlism,
            $tag: '.float-sm-right ',
            class: 'wallet-creation',
            $$: [
              { $virus: buttonismWithSize('Create Hd Wallet', 'success', 'small'),
                onclick(){ custodianManager()._sendHdToCustodian(hdNode) }
              },
              { $tag: 'span', $text: ' ' },
              { $virus: buttonismWithSize('Create Plain Wallet', 'success', 'small'),
                onclick(){ custodianManager()._sendPlainToCustodian(hdNode) }
              }
            ]
          }
        ]
      }
    },
    _hdNodeEthContainer(node) {
      let self = this
      return {
        $virus: hamlism,
        $tag: 'li.list-group-item',
        _toRskAddress: '',
        _fromRskAddress: '',
        _rskAmount: 0,
        $$: [
          rskModal(self._networkName),
          { $tag: 'button.close',
            $text: '×',
            onclick(e) { self._ethAddresses = _.without(self._ethAddresses, node) }
          },
          { $tag: 'p span', $text: node.message.path },
          { $tag: 'input.form-control.form-control-sm',
            value: node.message.address,
            readonly: true
          },
          {
            $virus: hamlism,
            $tag: '.float-sm-right ',
            class: 'rsk-tx-creation',
            $$: [
              { $virus: buttonismWithSize('Create Transaction', 'success', 'small'),
                'data-id': 'rsk-tx-creation',
                'data-toggle': 'modal',
                'data-target': '#modalDialogRsk',
                onclick(e) {
                  this._fromRskAddress = node.message.address
                  document.querySelector('#modalDialogRsk').$update()
                }
              }
            ]
          }
        ]
      }
    },
    $$: [
      { $type: 'h4', $text: '1. Add some HD nodes' },
      { $virus: formGroupism('Derive a path?'),
        $tag: 'input#multisig_setup_path',
        $help: `Derive this path from the provided xpub or trezor, and add that
          HD node instead instead of the root one.
          Mostly useful when just deriving single addresses from trezor.`,
        name: 'path',
        placeholder: "You'll likely won't need this",
        type: 'text',
        onchange(e){ this._setPath(e.target.value) }
      },
      { class: 'form-group input-group', $$: [
        { $tag: 'span.input-group-addon', $text: 'Existing Xpub' },
        { $tag: 'input#multisig_setup_xpub.form-control',
          name: 'xpub',
          type: 'text',
          $update() { this.value = this._xpub  },
          onchange(e){ this._xpub = e.target.value }
        },
        { class: 'input-group-btn add-node-group', $$: [
          { $virus: buttonism('Add node'),
            onclick(){ this._addHdNodeFromXpub(this._xpub) }
          }
        ]},
      ]},
      { $virus: buttonism('Add node from Trezor'),
        'data-id': 'add-node-from-trezor',
        onclick(){ this._hdNodeFromTrezor() }
      },
      { $tag: 'ul.list-group.hd-nodes.mt-3',
        $update() {
          this.innerHTML = ''
          _.each(this._hdNodes, (n) => this.$build(this._hdNodeContainer(n)))
        }
      },
      { $tag: 'ul.list-group.hd-nodes.mt-3',
        $update() {
          this.innerHTML = ''
          _.each(this._ethAddresses, (n) => this.$build(this._hdNodeEthContainer(n)))
        }
      }
    ]
  }
}
