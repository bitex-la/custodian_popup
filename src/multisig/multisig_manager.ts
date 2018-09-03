import { updateEpidemic } from '../lib/update_epidemic'
import { CustodianManager } from '../services/custodian_manager.js'
import { buttonism, formGroupism } from '../lib/bootstrapism'
import { hamlism } from '../lib/hamlism'
import config from '../config'

export function multisigManager () {
  return {
    class: 'well well-sm',
    $virus: updateEpidemic,
    _path: '',
    _required: 0,
    $$: [
      { $type: 'h4', $text: '2. Create a multisig address' },
      { $virus: formGroupism('Required signers'),
        $tag: 'input',
        name: 'required',
        type: 'text',
        onkeyup (e: Event) { this._required = parseInt((<HTMLInputElement> e.target).value) }
      },
      { $virus: formGroupism('Path within multisig tree'),
        $tag: 'input',
        name: 'path',
        type: 'text',
        onkeyup (e: Event) { this._path = (<any> window)._.trim((<HTMLInputElement> e.target).value, '/') }
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

function generateMultisig (hdNodes: any[], required: number, multisigPath: string, network: string) {
  if (hdNodes.length < 2) {
    return { error: 'Add at least 2 HD nodes, then create a multisig address.' };
  }

  required = required || 0;

  if (required === 0) {
    return {error: 'Now set how many signers would be needed.'};
  }

  if (hdNodes.length < required) {
    return { error: "You can't possibly have more signers than nodes." };
  }

  hdNodes[0].keyPair.getPublicKeyBuffer().toString('hex');

  let derived = hdNodes;

  if (multisigPath) {
    try {
      derived = derived.map((n) => n.derivePath(multisigPath));
    } catch (e) {
      return { error: 'Path should be something like /1/2/0' };
    }
  }

  let pubKeys = derived.map((n) => n.getPublicKeyBuffer())
  let redeemScript = (<any> window).bitcoin.script.multisig.output.encode(required, pubKeys)
  let scriptPubKey = (<any> window).bitcoin.script.scriptHash.output.encode(
    (<any> window).bitcoin.crypto.hash160(redeemScript)
  )
  let address = (<any> window).bitcoin.address.fromOutputScript(scriptPubKey, network)

  let pathArray = (<any> window)._.compact((<any> window)._.split(multisigPath, '/'))
  return {
    address: address,
    as_input: nodesAsInput(hdNodes, pathArray, required)
  }
}

function nodesAsInput (hdNodes: any[], path: string, required: number) {
  return {
    address_n: path,
    prev_hash: '[previous transaction hash]',
    prev_index: '[UTXO position in previous transaction]',
    script_type: 'SPENDMULTISIG',
    multisig: {
      signatures: (<any> window)._.fill(Array(hdNodes.length), ''),
      m: required,
      pubkeys: (<any> window)._.map(hdNodes, (n: any) => (
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
