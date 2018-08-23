import { selectGroupism } from '../lib/bootstrapism'
import { updateEpidemic } from '../lib/update_epidemic.js'
import networks from '../lib/networks.js'
import { hdNodesManager } from './hd_nodes_manager.js'
import { multisigManager } from './multisig_manager.js'

var _ = require('lodash')
export function multisigSetupHandler () {
  return {
    id: 'multisig_setup',
    $virus: updateEpidemic,
    _hdNodes: [],
    _ethAddresses: [],
    _addEthAddress (data) {
      this._ethAddresses.push(data)
    },
    $update () {
      _.each(this._hdNodes, (n) => { n.network = this._network() })
    },
    $components: [
      { $virus: selectGroupism('Network', _.keys(networks), 'bitcoin'),
        id: 'multisig_setup_network',
        name: 'network',
        $update () { this.value = this._networkName },
        onchange (e) { this._networkName = e.target.value }
      },
      hdNodesManager(),
      { $tag: 'hr' },
      multisigManager()
    ]
  }
}
