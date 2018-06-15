import * as device from './device.js'
import * as bitcoin from 'bitcoinjs-lib'
import {showError, loading, notLoading} from './messages.js'
import {hamlism} from './lib/hamlism.js'
import {buttonism, select_groupism, form_groupism} from './lib/bootstrapism.js'
import {update_epidemic} from './lib/update_epidemic.js'
import {walletService} from './services/wallet_service.js'

var bip32 = require('bip32-path')
var _ = require('lodash')
 
window.bitcoin = bitcoin

export function multisigSetupHandler(){
  let id = 'multisig_setup'
  return {
    id: 'multisig_setup',
    $virus: update_epidemic,
    _hdNodes: [],
    _network_name: 'bitcoin',
    _network(){
      return bitcoin.networks[this._network_name]
    },
    $update(){
      _.each(this._hdNodes, (n) => n.keyPair.network = this._network())
    },
    $components: [
      { $virus: select_groupism('Network', _.keys(bitcoin.networks), 'bitcoin'),
        id: 'multisig_setup_network',
        name: 'network',
        onchange(e){ this._network_name = e.target.value }
      },
      hdNodesManager(),
      { $tag: 'hr' },
      multisigManager(),
    ],
  }
}

function hdNodesManager(){
  return {
    class: "well well-sm",
    _path: [],
    _setPath: function(string){
      this._path = string ? bip32.fromString(string).toPathArray() : []
    },
    _xpub: null,
    _hdNodeFromTrezor(){
      loading()
      device.run((d) => {
        return d.session.getPublicKey(this._path, this._network_name)
          .then((result) => {
            this._addHdNodeFromXpub(result.message.xpub)
            notLoading()
          })
      })
    },
    _addHdNodeFromXpub(xpub){
      this._hdNodes.push(bitcoin.HDNode.fromBase58(xpub, this._network()))
    },
    _hdNodeContainer(hdNode){
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
          }
        ]
      }
    },
    $$: [
      { $type: 'h4', $text: '1. Add some HD nodes' },
      { $virus: form_groupism('Derive a path?'),
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
          onchange(e){ this._xpub = e.target.value }
        },
        { class: 'input-group-btn', $$: [
          { $virus: buttonism('Add node'),
            onclick(){ this._addHdNodeFromXpub(this._xpub) }
          }
        ]},
      ]},
      { $virus: buttonism('Add node from Trezor'),
        onclick(){ this._hdNodeFromTrezor() }
      },
      { $tag: 'ul.list-group.hd-nodes.mt-3',
        $update(){
          this.innerHTML = ''
          _.each(this._hdNodes, (n) => this.$build(this._hdNodeContainer(n)))
        }
      }
    ]
  }
}

function custodianManager() {
  return {
    _sendMultisigToCustodian(wallet) {
      let xpubs     = _.map(wallet._hdNodes, (node) => node.neutered().toBase58())

      let multisigWallet = {
        data: {
          attributes: {
            version: wallet._hdNodes.length.toString(),
            xpubs: xpubs,
            signers: parseInt(wallet._required),
          },
          type: 'multisig_wallet'
        }
      }

      let multisigWalletResponse = {}
      walletService().create('/multisig_wallets',
        multisigWallet,
        (multisigWalletResponse) => {
          _.forEach(wallet._hdNodes, (node) => {
            let address = {
              data: {
                attributes: {
                  address: node.getAddress(),
                  path: []
                },
                type: 'hd_address'
              }
            }
            walletService().create('/multisig_wallets/' + multisigWalletResponse.data.id + '/relationships/addresses', 
              address,
              (address) => console.log('Address saved'),
              (error) => console.log(error))
          })
          console.log('Wallet saved')
        },
        (error) => console.log(error))
    }
  }
}

function multisigManager(){
  return {
    class: "well well-sm",
    $virus: update_epidemic,
    _path: null,
    _required: null,
    custodianManager,
    $$: [
      { $type: 'h4', $text: '2. Create a multisig address' },
      { $virus: form_groupism('Required signers'),
        $tag: 'input',
        name: 'required',
        type: 'text',
        onkeyup(e){ this._required = e.target.value }
      },
      { $virus: form_groupism('Path within multisig tree'),
        $tag: 'input',
        name: 'path',
        type: 'text',
        onkeyup(e){ this._path = _.trim(e.target.value, '/') }
      },
      { $virus: buttonism('Submit', 'success'),
        onclick(){ custodianManager()._sendMultisigToCustodian(this) }
      },
      { $update(){
          let json = generateMultisig(this._hdNodes, this._required,
            this._path, this._network())

          let component;
          if(json.error){
            component = { $tag: '.alert.alert-info', $text: json.error }
          }else{
            component = { $tag: '.card', $$: [
              { $tag: '.card-header', $text: json.address },
              { $tag: '.card-body', $$: [
                { $tag: 'p.card-text',
                  $text: 'This is how you would use this address as an input'
                },
                { $tag: 'textarea.form-control',
                  rows: 20,
                  $text: JSON.stringify(json.as_input, null, 2)
                }
              ]}
            ]}
          }

          this.innerHTML = ''
          this.$build(hamlism(component))
        }
      }
    ]
  }
}

function generateMultisig(hdNodes, required, multisig_path, network){
  if(hdNodes.length < 2){
    return { error: 'Add at least 2 HD nodes, then create a multisig address.' }
  }

  required = parseInt(required) || 0

  if(required == 0){
    return {error: 'Now set how many signers would be needed.'}
  }

  if(hdNodes.length < required){
    return { error: "You can't possibly have more signers than nodes." }
  }

  hdNodes[0].keyPair.getPublicKeyBuffer().toString('hex')

  let derived = hdNodes;

  if(multisig_path){
    try {
      derived = derived.map((n) => n.derivePath(multisig_path))
    }catch(e){
      return { error: "Path should be something like /1/2/0" }
    }
  }

  let pubKeys = derived.map((n) => n.getPublicKeyBuffer())
  let redeemScript = bitcoin.script.multisig.output.encode(required, pubKeys)
  let scriptPubKey = bitcoin.script.scriptHash.output.encode(
    bitcoin.crypto.hash160(redeemScript)
  )
  let address = bitcoin.address.fromOutputScript(scriptPubKey, network)

  let path_array = _.compact(_.split(multisig_path, '/'))
  return {
    address: address,
    as_input: nodes_as_input(hdNodes, path_array, required)
  }
}

function nodes_as_input(hdNodes, path, required){
  return {
    address_n: path,
    prev_hash: '[previous transaction hash]',
    prev_index: "[UTXO position in previous transaction]",
    script_type: 'SPENDMULTISIG',
    multisig: {
      signatures: _.fill(Array(hdNodes.length), ''),
      m: required,
      pubkeys: _.map(hdNodes, (n) => (
        {
          address_n: path,
          node: {
            chain_code: n.chainCode.toString('hex'),
            depth: n.depth,
            child_num: 0,
            fingerprint: 0,
            public_key: n.getPublicKeyBuffer().toString('hex')
          }
        }
      ))
    }
  }
}
