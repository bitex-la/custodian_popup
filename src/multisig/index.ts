import { selectGroupism } from '../lib/bootstrapism';
import { updateEpidemic } from '../lib/update_epidemic.js';
import * as networks from '../lib/networks.js';
import { hdNodesManager } from './hd_nodes_manager';
import { multisigManager } from './multisig_manager';

var _ = require('lodash');

export function multisigSetupHandler () {
  let hdNodes: any[] = [];
  return {
    id: 'multisig_setup',
    $virus: updateEpidemic,
    _hdNodes: hdNodes,
    $update() {
      _.each(this._hdNodes, (n: { network: {}}) => { n.network = this._network() })
    },
    $components: [
      { $virus: selectGroupism('Network', _.keys(networks)),
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
