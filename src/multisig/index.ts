import { selectGroupism } from '../lib/bootstrapism';
import { updateEpidemic } from '../lib/update_epidemic';
import * as networks from '../lib/networks.js';
import { hdNodesManager } from './hd_nodes_manager';
import { multisigManager } from './multisig_manager';

export function multisigSetupHandler () {
  let hdNodes: any[] = [];
  let xpubs: string[] = [];
  return {
    id: 'multisig_setup',
    $virus: updateEpidemic,
    _hdNodes: hdNodes,
    _xpubs: xpubs,
    $update() {
      this._hdNodes.forEach((n: { network: {}}) => { n.network = this._network() });
    },
    $components: [
      { $virus: selectGroupism('Network', networks),
        id: 'multisig_setup_network',
        name: 'network',
        $update () { this.value = this._networkName },
        onchange (e: Event) { this._networkName = (<HTMLInputElement> e.target).value }
      },
      hdNodesManager(),
      { $tag: 'hr' },
      multisigManager()
    ]
  }
}
