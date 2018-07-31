import * as device from '../device.js'
import { rskModal } from '../components/rsk_modal.js'
import { buttonism, buttonismWithSize, selectGroupism, formGroupism } from '../lib/bootstrapism.js'
import { hamlism } from '../lib/hamlism.js'
import { showError, loading, notLoading } from '../messages.js'
import { CustodianManager } from '../services/custodian_manager.js'
import config from '../config.js'
import Wallet from 'ethereumjs-wallet'

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
      let networkName = this._networkName
      loading()
      device.run((d) => {
        let _path = this._path
        switch(networkName) {
          case 'rsk':
          case 'rsk_testnet':
            d.session.getPublicKey(config.rskTestNetPath, 'bitcoin')
              .then((result) => {
                d.session.ethereumGetAddress(config.rskTestNetPath)
                  .then((address) => {
                    let hdNode = bitcoin.HDNode.fromBase58(result.message.xpub, this._network())
                    hdNode.ethAddress = address.message.address
                    hdNode.getAddress = () => {
                      switch(self._networkName) {
                        case 'rsk':
                        case 'rsk_testnet':
                          return hdNode.ethAddress
                        default:
                          return hdNode.keyPair.getAddress()
                      }
                    }
                    this._hdNodes.push(hdNode)
                    notLoading()
                  })
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
      let networkName = this._network()
      let hdNode = bitcoin.HDNode.fromBase58(xpub, networkName)
      this._hdNodes.push(hdNode)
    },
    _hdNodeContainer(hdNode) {
      let self = this
      return {
        $virus: hamlism,
        _toRskAddress: '',
        _fromRskAddress: '',
        _rskAmount: 0,
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
              rskModal(self._networkName),
              { $virus: buttonismWithSize('Create Transaction', 'success', 'small'),
                'data-id': 'rsk-tx-creation',
                'data-toggle': 'modal',
                'data-target': '#modalDialogRsk',
                $update() {
                  if (self._networkName === 'rsk' || self._networkName === 'rsk_testnet') {
                    this.classList.add('visible')
                  } else {
                    this.classList.add('invisible')
                  }
                },
                onclick(e) {
                  this._fromRskAddress = hdNode.getAddress()
                  document.querySelector('#modalDialogRsk').$update()
                }
              },
              { $tag: 'span', $text: ' ' },
              { $virus: buttonismWithSize('Create Hd Wallet', 'success', 'small'),
                onclick(){ 
                  config.nodeSelected = config._chooseBackUrl(self._networkName)
                  CustodianManager(config)._sendHdToCustodian(hdNode) 
                }
              },
              { $tag: 'span', $text: ' ' },
              { $virus: buttonismWithSize('Create Plain Wallet', 'success', 'small'),
                onclick(){
                  config.nodeSelected = config._chooseBackUrl(self._networkName)
                  CustodianManager(config)._sendPlainToCustodian(hdNode) 
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
            onclick(){
              try {
                let self = this
                switch(this._networkName) {
                  case 'rsk':
                  case 'rsk_testnet':
                    let hdNode = bitcoin.HDNode.fromBase58(self._xpub, this._network())
                    let ethWallet = Wallet.fromExtendedPublicKey(self._xpub)
                    hdNode.ethAddress = ethWallet.getAddress().toString('hex')
                    hdNode.getAddress = () => {
                      switch(self._networkName) {
                        case 'rsk':
                        case 'rsk_testnet':
                          return hdNode.ethAddress
                        default:
                          return hdNode.keyPair.getAddress()
                      }
                    }
                    this._hdNodes.push(hdNode)
                    break
                  default:
                    this._addHdNodeFromXpub(this._xpub) 
                    break
                }
              } catch (error) {
                showError(error)
              }
            }
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
