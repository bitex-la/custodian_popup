import { updateEpidemic } from '../lib/update_epidemic.js'
import { CustodianManager } from '../services/custodian_manager.js'
import { buttonism, formGroupism } from '../lib/bootstrapism.js'
import { hamlism } from '../lib/hamlism'
import config from '../config'

export function multisigManager () {
  return {
    class: 'well well-sm',
    $virus: updateEpidemic,
    _path: null,
    _required: null,
    $$: [
      { $type: 'h4', $text: '2. Create a multisig address' },
      { $virus: formGroupism('Required signers'),
        $tag: 'input',
        name: 'required',
        type: 'text',
        onkeyup (e) { this._required = e.target.value }
      },
      { $virus: formGroupism('Path within multisig tree'),
        $tag: 'input',
        name: 'path',
        type: 'text',
        onkeyup (e) { this._path = window._.trim(e.target.value, '/') }
      },
      { $virus: buttonism('Create Multisig Wallet', 'success'),
        onclick () {
          config.nodeSelected = config._chooseBackUrl(this._networkName)
          CustodianManager(config)._sendMultisigToCustodian(this)
        }
      },
      {
        $update () {
          let json = generateMultisig(this._hdNodes, this._required,
            this._path, this._network())

          let component
          if (json.error) {
            component = { $tag: '.alert.alert-info', $text: json.error }
          } else {
            component = {
              $tag: '.card',
              $$: [{
                $tag: '.card-header',
                $text: json.address
              }]
            }
          }

          this.innerHTML = ''
          this.$build(hamlism(component))
        }
      }
    ]
  }
}

function generateMultisig (hdNodes, required, multisigPath, network) {
  if (hdNodes.length < 2) {
    return { error: 'Add at least 2 HD nodes, then create a multisig address.' }
  }

  required = parseInt(required) || 0

  if (required === 0) {
    return {error: 'Now set how many signers would be needed.'}
  }

  if (hdNodes.length < required) {
    return { error: "You can't possibly have more signers than nodes." }
  }

  hdNodes[0].keyPair.getPublicKeyBuffer().toString('hex')

  let derived = hdNodes

  if (multisigPath) {
    try {
      derived = derived.map((n) => n.derivePath(multisigPath))
    } catch (e) {
      return { error: 'Path should be something like /1/2/0' }
    }
  }

  let pubKeys = derived.map((n) => n.getPublicKeyBuffer())
  let redeemScript = window.bitcoin.script.multisig.output.encode(required, pubKeys)
  let scriptPubKey = window.bitcoin.script.scriptHash.output.encode(
    window.bitcoin.crypto.hash160(redeemScript)
  )
  let address = window.bitcoin.address.fromOutputScript(scriptPubKey, network)

  let pathArray = window._.compact(window._.split(multisigPath, '/'))
  return {
    address: address,
    as_input: nodesAsInput(hdNodes, pathArray, required)
  }
}

function nodesAsInput (hdNodes, path, required) {
  return {
    address_n: path,
    prev_hash: '[previous transaction hash]',
    prev_index: '[UTXO position in previous transaction]',
    script_type: 'SPENDMULTISIG',
    multisig: {
      signatures: window._.fill(Array(hdNodes.length), ''),
      m: required,
      pubkeys: window._.map(hdNodes, (n) => (
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
