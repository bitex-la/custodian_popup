import * as device from './device.js'
import * as helpers from './helpers.js'
import * as bitcoin from 'bitcoinjs-lib'
import {showError, loading, notLoading} from './messages.js'
var bip32 = require('bip32-path')
var _ = require('lodash')
 
window.bitcoin = bitcoin

export function multisigSetupHandler(id){
  return {
    id: id,
    _hdNodes: [],
    _path: [],
    _network: 'bitcoin',
    
    $network(){
      return bitcoin.networks[this._network]
    },

    $hdNodeFromTrezor(){
      loading()
      device.run((d) => {
        return d.session.getPublicKey(this._path, this._network).then((result) => {
          this.$hdNodeFromXpub(result.message.xpub)
          notLoading()
        })
      })
    },

    $hdNodeFromXpub(xpub){
      let hdNode = bitcoin.HDNode.fromBase58(xpub, this.$network())
      this._hdNodes.push(hdNode)
      $('.hd-nodes', this)[0].$build(hdNodeContainer(this, hdNode))
    },

    $setPath(string){
      this._path = string ? bip32.fromString(string).toPathArray() : []
    },

    $generate(required, multisig_path){
      let result = generateMultisig(this._hdNodes, required, multisig_path, this.$network())
      if(result.ok){
        $('.multisigs', this)[0].$build(multisigContainer(result.multisig))
      }else{
        showError(result.error)
      }
    },

    $components: [
      helpers.select_group('Network', 'network', id,
        _.keys(bitcoin.networks), 'bitcoin', {
        onchange(e){ $(`#${id}`)[0]._network = e.target.value }
      }),
      helpers.text_input_group('Derivation Path', 'path', id, {
        onchange(e){ $(`#${id}`)[0].$setPath(e.target.value) }
      }),
      helpers.button('From Trezor', {
        onclick(e){ $(`#${id}`)[0].$hdNodeFromTrezor() }
      }),
      helpers.text_input_group('Xpub', 'xpub', id),
      helpers.button('From Xpub', {
        onclick(e){ $(`#${id}`)[0].$hdNodeFromXpub($(`#${id} [name="xpub"]`).val() ) }
      }),
      { $type: 'ul', class: 'list-group hd-nodes mt-3' },
      {
        $type: 'form',
        class: 'mt-3',
        $components: [
          helpers.text_input_group('Required signers', 'required', id),
          helpers.text_input_group('Path', 'multisig_path', id),
          helpers.button('Generate Multisig'),
        ],
        onsubmit(e){
          e.preventDefault()
          $(`#${id}`)[0].$generate(this.required.value, this.multisig_path.value)
        }
      },
      { class: 'multisigs mt-3' }
    ]
  }
}

function hdNodeContainer(wizard, hdNode){
  return {
    $type: 'li',
    class: 'list-group-item',

    $components: [
      { $type: 'button',
        class: 'close',
        $text: '×',
        onclick(e){
          wizard._nodes = _.without(wizard._nodes, hdNode)
          $(this).parents('li').remove()
        }
      },
      { $type: 'p', $components: [
        { $type: 'span', $text: hdNode.getAddress() },
        { $type: 'span', $text: hdNode.getAddress() },
      ]},
      { $type: 'small', $text: hdNode.neutered().toBase58() },
    ]
  }
}

function generateMultisig(hdNodes, required, multisig_path, network){
  required = parseInt(required) || 0

  if(required == 0){
    return {ok: false, error: 'Required signers must be a number greater than 0'}
  }

  if(hdNodes.length < required){
    return {ok: false, error: 'You requested more signers than available' }
  }

  hdNodes[0].keyPair.getPublicKeyBuffer().toString('hex')

  let derived = hdNodes;
  if(multisig_path){
    derived = derived.map((n) => n.derivePath(multisig_path))
  }

  let pubKeys = derived.map((n) => n.getPublicKeyBuffer())
  let redeemScript = bitcoin.script.multisig.output.encode(required, pubKeys)
  let scriptPubKey = bitcoin.script.scriptHash.output.encode(
    bitcoin.crypto.hash160(redeemScript)
  )
  let address = bitcoin.address.fromOutputScript(scriptPubKey, network)

  return {
    ok: true,
    multisig: {
      //xpubs: .map((s) => s.xpub),
      //path: paths[0],
      address: address
    }
  }
}

function multisigContainer(multisig) {
  return {
    class: 'card mt-3',
    $components: [{
      class: 'card-body',
      $components: [
        { $type: 'button',
          class: 'close',
          $text: '×',
          onclick(e){ $(this).parents('.card').remove() }
        },
        { $type: 'pre',
          $components: [{ $type: 'code', $text: JSON.stringify(multisig, null, 2)}]
        }
      ]
    }]
  }
}
