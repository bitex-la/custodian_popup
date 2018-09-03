import Cell from '../types/cell';
import { buttonism, buttonismWithSize, formGroupism } from '../lib/bootstrapism';
import { hamlism } from '../lib/hamlism';
import { showError, loading, notLoading } from '../messages';
import { CustodianManager } from '../services/custodian_manager.js';
import { Transaction } from '../lib/transaction';
import config from '../config';
var Wallet = require('ethereumjs-wallet');
var bip32 = require('bip32');

export function hdNodesManager () {
  return {
    class: 'well well-sm',
    _path: '[]',
    _setPath: function (string: string) {
      this._path = string ? bip32.fromString(string).toPathArray() : []
    },
    _xpub: '',
    _balance: ' Balance: 0',
    async _hdNodeFromTrezor () {
      let networkName = this._networkName
      loading()
      let _path = this._path.length === 0 ? config._chooseDerivationPath(networkName) : this._path
      const result = await (<any> window).TrezorConnect.getPublicKey({path: _path, coin: networkName})
      if (result.success) {
        this._addHdNodeFromXpub(result.payload.xpub)
        notLoading()
      } else {
        showError(result.payload.error)
      }
    },
    _addHdNodeFromXpub (xpub: string) {
      let self = this
      let networkName = this._network()
      let hdNode = bip32.fromBase58(xpub, networkName)
      hdNode.getAddress = () => {
        return (<any> window).bitcoin.payments.p2pkh({ pubkey: hdNode.publicKey, network: networkName }).address
      }
      hdNode.getBalance = async () => {
        let transaction = new Transaction()
        return transaction.getBalance(self._networkName, hdNode.getAddress())
      }
      this._hdNodes.push(hdNode)
    },
    _hdNodeContainer (hdNode: any) {
      let self = this
      hdNode.getBalance().then((balance: string) => {
        self._balance = ` Balance: ${balance}`;
        (<Cell> document.querySelector(`#balance-${hdNode.getAddress()}`)).$update();
      })
      return {
        $virus: hamlism,
        _toRskAddress: '',
        _fromRskAddress: '',
        $tag: 'li.list-group-item',
        $$: [
          { $tag: 'button.close',
            $text: '×',
            onclick (e: Event) { self._hdNodes = (<any> window)._.without(self._hdNodes, hdNode) }
          },
          {
            $tag: 'p span',
            $$: [
              {
                $tag: 'span',
                $text: hdNode.getAddress()
              },
              {
                $tag: 'span',
                id: `balance-${hdNode.getAddress()}`,
                $update () {
                  this.$text = self._balance
                }
              }
            ]
          },
          { $tag: 'input.form-control.form-control-sm',
            value: hdNode.neutered().toBase58(),
            readonly: true
          },
          {
            $virus: hamlism,
            $tag: '.float-sm-right ',
            class: 'wallet-creation',
            $$: [
              { $tag: 'span', $text: ' ' },
              { $virus: buttonismWithSize('Create Hd Wallet', 'success', 'small'),
                'data-id': 'hd-wallet-creation',
                onclick () {
                  config.nodeSelected = config._chooseBackUrl(self._networkName)
                  CustodianManager(config)._sendHdToCustodian(hdNode)
                }
              },
              { $tag: 'span', $text: ' ' },
              { $virus: buttonismWithSize('Create Plain Wallet', 'success', 'small'),
                onclick () {
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
        onchange (e: Event) { this._setPath((<HTMLInputElement> e.target).value) }
      },
      { class: 'form-group input-group',
        $$: [
          { $tag: 'span.input-group-addon', $text: 'Existing Xpub' },
          { $tag: 'input#multisig_setup_xpub.form-control',
            name: 'xpub',
            type: 'text',
            $update () { this.value = this._xpub },
            onchange (e: Event) { this._xpub = (<HTMLInputElement> e.target).value }
          },
          {
            class: 'input-group-btn add-node-group',
            $$: [{
              $virus: buttonism('Add node'),
              onclick () {
                try {
                  let self = this
                  switch (this._networkName) {
                    case 'rsk':
                    case 'rsk_testnet':
                      let hdNode = bip32.fromBase58(self._xpub, this._network())
                      let ethWallet = Wallet.fromExtendedPublicKey(self._xpub)
                      hdNode.ethAddress = ethWallet.getAddress().toString('hex')
                      hdNode.getAddress = () => {
                        switch (self._networkName) {
                          case 'rsk':
                          case 'rsk_testnet':
                            return hdNode.ethAddress
                          default:
                            return hdNode.keyPair.getAddress()
                        }
                      }
                      hdNode.getBalance = async () => {
                        let transaction = new Transaction()
                        return transaction.getRskBalance(hdNode.getAddress())
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
            }]
          }
        ]
      },
      { $virus: buttonism('Add node from Trezor'),
        'data-id': 'add-node-from-trezor',
        onclick () { this._hdNodeFromTrezor() }
      },
      { $tag: 'ul.list-group.hd-nodes.mt-3',
        $update () {
          this.innerHTML = '';
          (<any> window)._.each(this._hdNodes, (n: any) => this.$build(this._hdNodeContainer(n)));
        }
      }
    ]
  }
}