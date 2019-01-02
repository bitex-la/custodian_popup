import { updateEpidemic } from "../lib/update_epidemic";
import { CustodianManager } from "../services/custodian_manager";
import { buttonism, formGroupism } from "../lib/bootstrapism";
import { hamlism } from "../lib/hamlism";
import config from "../config";
var bip32 = require("bip32");

export function multisigManager() {
  return {
    class: "well well-sm",
    $virus: updateEpidemic,
    _path: "",
    _required: 0,
    _multisigAddress: '',
    $$: [
      { $type: "h4", $text: "2. Create a multisig address" },
      {
        $virus: formGroupism("Required signers"),
        $tag: "input#required-signers",
        name: "required",
        type: "text",
        onkeyup(e: Event) {
          this._required = parseInt((<HTMLInputElement>e.target).value);
        }
      },
      {
        $virus: formGroupism("Path within multisig tree"),
        $tag: "input",
        name: "path",
        type: "text",
        onkeyup(e: Event) {
          this._path = (<HTMLInputElement>e.target).value.replace('/', '');
        }
      },
      {
        $virus: formGroupism("Address"),
        $tag: "input",
        id: "multisig-address",
        name: "multisig_address",
        type: "text",
        onchange(e: Event) {
          this._multisigAddress = (<HTMLInputElement>e.target).value;
        },
        $update() {
          this.value = this._multisigAddress;
        }
      },
      {
        $virus: buttonism("Create Multisig Wallet", "success"),
        onclick() {
          config.nodeSelected = config._chooseBackUrl(this._networkName);
          CustodianManager(config)._sendMultisigToCustodian(this);
        }
      },
      {
        $update() {
          let signers = (<HTMLInputElement>(
            document.getElementById("required-signers")
          )).value;
          let json = generateMultisig(
            parseInt(signers),
            this._hdNodes,
            this._xpubs,
            this._required,
            this._path,
            this._network()
          );

          let component;
          if (json.error) {
            component = { $tag: ".alert.alert-info", $text: json.error };
          } else {
            this._multisigAddress = json.address;
            (<any> window.document.getElementById('multisig-address')).$update()
          }
        }
      }
    ]
  };
}

function generateMultisig(
  signers: number,
  hdNodes: any[],
  xpubs: string[],
  required: number,
  multisigPath: string,
  network: any
) {
  if (xpubs.length < 2) {
    return {
      error: "Add at least 2 HD nodes, then create a multisig address."
    };
  }

  required = required || 0;

  if (required === 0) {
    return { error: "Now set how many signers would be needed." };
  }

  if (xpubs.length < required) {
    return { error: "You can't possibly have more signers than nodes." };
  }

  let pubkeys = xpubs.map((xpub: string) => {
    let node = bip32.fromBase58(xpub, network);
    return Buffer.from(node.publicKey, 'hex');
  });
  let p2sh = (<any>window).bitcoin.payments.p2sh({
    redeem: (<any>window).bitcoin.payments.p2ms({ m: signers, network, pubkeys }), network
  });

  let pathArray = multisigPath.split('/').filter((multisigPart) => multisigPart).map((part) => parseInt(part));
  return {
    address: p2sh.address,
    as_input: nodesAsInput(hdNodes, pathArray, required)
  };
}

function nodesAsInput(hdNodes: any[], path: number[], required: number) {
  return {
    address_n: path,
    prev_hash: "[previous transaction hash]",
    prev_index: "[UTXO position in previous transaction]",
    script_type: "SPENDMULTISIG",
    multisig: {
      signatures: Array(hdNodes.length).fill(''),
      m: required,
      pubkeys: hdNodes.map((n: any) => ({
        address_n: path,
        node: {
          chain_code: n.chainCode.toString("hex"),
          depth: n.depth,
          child_num: 0,
          fingerprint: 0,
          public_key: n.publicKey.toString("hex")
        }
      }))
    }
  };
}
