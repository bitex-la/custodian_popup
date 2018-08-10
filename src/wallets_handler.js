import {hamlism} from './lib/hamlism.js'
import {updateEpidemic} from './lib/update_epidemic.js'
import {selectGroupism, selectObjectGroupism, buttonism, buttonismWithSize} from './lib/bootstrapism.js'
import {showError} from './messages.js'
import {modal} from './components/utxos_modal.js'
import {modalTx} from './components/output_tx_modal.js'
import {addressesList} from './components/addresses_list.js'
import {utxosList} from './components/utxos_list.js'

import {walletService} from './services/wallet_service.js'

import networks from './lib/networks.js'
import config from './config'

export function walletHandler() {
  return {
    id: 'wallets',
    $virus: updateEpidemic,
    class: 'form',
    _walletType: '',
    _walletId: 0,
    _address: '',
    _addresses: [],
    _wallet: {},
    _wallets: [],
    _utxos: [],
    _displayUtxos: 'none',
    _displayAddresses: 'none',
    _rawTransaction: {
      outputs: [],
      inputs: [],
      transactions: []
    },
    _addWallets(wallets) {
      this._wallets = wallets
      this._addresses = []
    },
    _addAddresses(addresses) {
      this._addresses = addresses
    },
    _addUtxos(utxos) {
      this._utxos = utxos
    },
    _getStrAddress(address) {
      switch(this._walletType) {
        case '/plain_wallets':
          return address.id
        default:
          return address.attributes.address
      }
    },
    _buildWalletsTable() {
      switch(this._walletType) {
        case '/plain_wallets':
          return ['Id', 'Version', '', '']
        case '/hd_wallets':
          return ['Id', 'Version', 'XPub', '', '']
        case '/multisig_wallets':
          return ['Id', 'Version', 'XPubs', 'Signers', '', '']
        default:
          return []
      }
    },
    $$: [
      modal(function (walletType, walletId, since, limit) {
        let self = this
        let url = `${self._walletType}/${self._walletId}/get_utxos?since=${since}&limit=${limit}`
        walletService(config).list(url, (successData) => {
          self._since = ''
          self._limit = ''
          self._displayUtxos = 'block'
          self._rawTransaction = successData.data
          self._addUtxos(_.map(successData.data, (utxo) => {
            return {
              amount: utxo.attributes.transaction.satoshis,
              prev_hash: utxo.attributes.transaction.transaction_hash,
              prev_index: utxo.attributes.transaction.position
            }
          }))
        },
        function (errorData) { console.log(errorData) })
      }),
      { $virus: selectGroupism('Network', _.keys(networks), 'bitcoin'),
        name: 'network',
        $update(){ this.value = this._networkName },
        onchange(e){ this._networkName = e.target.value }
      },
      { $virus: selectObjectGroupism('Wallet Type', [
          {id: '', text: 'Select a type wallet'},
          {id: '/plain_wallets', text: 'Plain'},
          {id: '/hd_wallets', text: 'Hd'},
          {id: '/multisig_wallets', text: 'Multisig'}], 'plain_wallet'),
        name: 'wallet_type',
        onchange(e) {
          let self = this
          this._walletType = e.target.value
          this._wallets = []
          document.getElementsByClassName('wallets-table')[0].classList.remove('d-none')
          config.nodeSelected = config._chooseBackUrl(self._networkName)
          walletService(config).list(self._walletType,
            (successData) => self._addWallets(successData.data),
            (errorData) => console.log(errorData))
        }
      },
      {
        class: 'well',
        $$: [
          {
            $tag: 'table.table.d-none.wallets-table',
            $$: [
              {
                $tag: 'thead',
                $$: [
                  {
                    $tag: 'tr',
                    _buildWalletHeaders(header) {
                      return { $tag: 'th', $virus: hamlism, $text: header }
                    },
                    $update() {
                      this.innerHTML = ''
                      _.each(this._buildWalletsTable(), (h) => this.$build(this._buildWalletHeaders(h)))
                    }
                  }
                ]
              },
              {
                $tag: 'tbody',
                _fillWallet(wallet) {
                  let self = this
                  let addressesButton = {
                    $virus: buttonismWithSize('Show Addresses', 'info', 'small'),
                    'data-id': 'show-addresses',
                    onclick() { 
                      self._displayUtxos = 'none'
                      self._displayAddresses = 'block'
                      self._walletId = wallet.id

                      let addresses = {}
                      walletService(config).list(`${self._walletType}/${wallet.id}/relationships/addresses`,
                        (successData) => {

                          _.forEach(successData.data, (address) => {
                            addresses[self._getStrAddress(address)] = 0
                          })

                          let url = `${self._walletType}/${self._walletId}/get_utxos?since=0&limit=10000`
                          walletService(config).list(url, (successData) => {

                            _.forEach(successData.data, (utxo) => {
                              let addressStr = self._walletType === '/plain_wallets' ? utxo.attributes.address.id : utxo.attributes.address.address
                              addresses[addressStr] += utxo.attributes.transaction.satoshis
                            })
                            self._addAddresses(_.map(_.toPairs(addresses), d => _.fromPairs([d])))
                          })

                        },
                        (errorData) => showError(errorData))
                    }
                  }
                  let utxosButton = {
                    $virus: buttonismWithSize('Show Utxos', 'info', 'small'),
                    'data-id': 'show-utxos',
                    'data-toggle': 'modal',
                    'data-target': '#modalDialog',
                    onclick() { 
                      self._walletId = wallet.id
                      self._displayAddresses = 'none'
                    }
                  }
                  switch(self._walletType) {
                    case '/plain_wallets':
                      return { $tag: 'tr',
                               $virus: hamlism,
                               $$: [{ $tag: 'td', $text: wallet.id },
                                    { $tag: 'td', $text: wallet.attributes.version },
                                    { $tag: 'td', $$: [ addressesButton ] },
                                    { $tag: 'td', $$: [ utxosButton ] }] }
                    case '/hd_wallets':
                      return { $tag: 'tr',
                               $virus: hamlism,
                               $$: [{ $tag: 'td', $text: wallet.id },
                                    { $tag: 'td', $text: wallet.attributes.version },
                                    { $tag: 'td', $text: wallet.attributes.xpub.substring(0, 10), title: wallet.attributes.xpub },
                                    { $tag: 'td', $$: [ addressesButton ] },
                                    { $tag: 'td', $$: [ utxosButton ] }] }
                    case '/multisig_wallets':
                      return { $tag: 'tr', 
                               $virus: hamlism,
                               $$: [{ $tag: 'td', $text: wallet.id },
                                    { $tag: 'td', $text: wallet.attributes.version },
                                    { $tag: 'td',
                                      $text: _.map(wallet.attributes.xpubs, (xpub) => xpub.substring(0, 10)).join(', '),
                                      title: wallet.attributes.xpubs.join(', ') },
                                    { $tag: 'td', $text: wallet.attributes.signers }, 
                                    { $tag: 'td', $$: [ addressesButton ] },
                                    { $tag: 'td', $$: [ utxosButton ] }] }
                    default:
                      return []
                  }
                },
                $update() {
                  this.innerHTML = ''
                  _.each(this._wallets, (w) => this.$build(this._fillWallet(w)))
                }
              }
            ]
          },
          addressesList(), utxosList(), modalTx()
        ]
      }
    ]
  }
}
