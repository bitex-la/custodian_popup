import { updateEpidemic } from '../lib/update_epidemic.js'
import { CustodianManager } from '../services/custodian_manager.js'
import { buttonism, buttonismWithSize, selectGroupism, formGroupism } from '../lib/bootstrapism.js'
import { hamlism } from '../lib/hamlism.js'
import config from '../config'

export function multisigManager(){
  return {
    class: "well well-sm",
    $virus: updateEpidemic,
    _path: null,
    _required: null,
    $$: [
      { $type: 'h4', $text: '2. Create a multisig address' },
      { $virus: formGroupism('Required signers'),
        $tag: 'input',
        name: 'required',
        type: 'text',
        onkeyup(e){ this._required = e.target.value }
      },
      { $virus: formGroupism('Path within multisig tree'),
        $tag: 'input',
        name: 'path',
        type: 'text',
        onkeyup(e){ this._path = _.trim(e.target.value, '/') }
      },
      { $virus: buttonism('Create Multisig Wallet', 'success'),
        onclick(){
          config.nodeSelected = config._chooseBackUrl(this._networkName)
          CustodianManager(config)._sendMultisigToCustodian(this)
        }
      },
      { $update(){
          let json = generateMultisig(this._hdNodes, this._required,
            this._path, this._network())

          let component;
          if(json.error){
            component = { $tag: '.alert.alert-info', $text: json.error }
          }else{
            component = { $tag: '.card', $$: [
              { $tag: '.card-header', $text: json.address }
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
  let redeemScript = window.bitcoin.script.multisig.output.encode(required, pubKeys)
  let scriptPubKey = window.bitcoin.script.scriptHash.output.encode(
    window.bitcoin.crypto.hash160(redeemScript)
  )
  let address = window.bitcoin.address.fromOutputScript(scriptPubKey, network)

  let path_array = _.compact(_.split(multisig_path, '/'))
  return {
    address: address,
    as_input: nodesAsInput(hdNodes, path_array, required)
  }
}
