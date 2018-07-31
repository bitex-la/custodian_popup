import * as device from '../device.js'
import * as bitcoin from 'bitcoinjs-lib'
import { showError, loading, notLoading } from '../messages.js'
import { hamlism } from '../lib/hamlism.js'
import { buttonism, buttonismWithSize, selectGroupism, formGroupism } from '../lib/bootstrapism.js'
import { updateEpidemic } from '../lib/update_epidemic.js'
import { walletService } from '../services/wallet_service.js'
import networks from '../lib/networks.js'
import { hdNodesManager } from './hd_nodes_manager.js'
import { multisigManager } from './multisig_manager.js'

var bip32 = require('bip32-path')
var _ = require('lodash')
 
window.bitcoin = bitcoin

export function multisigSetupHandler(){
  let id = 'multisig_setup'
  return {
    id: 'multisig_setup',
    $virus: updateEpidemic,
    _hdNodes: [],
    _ethAddresses: [],
    _network(){
        switch(this._networkName) {
          case 'rsk':
          case 'rsk_testnet':
            return bitcoin.networks['bitcoin']
          default:
            return bitcoin.networks[this._networkName]
        }
    },
    _addEthAddress(data) {
      this._ethAddresses.push(data)
    },
    $update(){
      _.each(this._hdNodes, (n) => n.keyPair.network = this._network())
    },
    $components: [
      { $virus: selectGroupism('Network', _.keys(networks), 'bitcoin'),
        id: 'multisig_setup_network',
        name: 'network',
        onchange(e){ this._networkName = e.target.value }
      },
      hdNodesManager(),
      { $tag: 'hr' },
      multisigManager(),
    ],
  }
}

function nodesAsInput(hdNodes, path, required){
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
