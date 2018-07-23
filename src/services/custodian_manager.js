import { walletService } from '../services/wallet_service.js'
import { showError, showInfo } from '../messages.js'

export function custodianManager() {
  return {
    _createWallet(type, wallet, hdNodes, buildAddress) {
      walletService().create(`/${type}`,
        wallet,
        (walletResponse) => {
          _.forEach(hdNodes, (node) => {
            let address = buildAddress(node.getAddress())
            walletService().create(`/${type}/${walletResponse.data.id}/relationships/addresses`,
              address,
              (address) => showInfo('Address saved'),
              (error) => showError(error.statusText))
          })
          showInfo('Wallet saved')
        },
        (error) => showError(error.statusText))
    },
    _sendMultisigToCustodian(wallet) {
      let xpubs = _.map(wallet._hdNodes, (node) => node.neutered().toBase58())

      let multisigWallet = {
        data: {
          attributes: {
            version: wallet._hdNodes.length.toString(),
            xpubs: xpubs,
            signers: parseInt(wallet._required),
          },
          type: 'multisig_wallet'
        }
      }

      this._createWallet('multisig_wallets',
        multisigWallet,
        wallet._hdNodes,
        (address) => {
          return {
            data: {
              attributes: {
                address: address,
                path: []
              },
              type: 'hd_address'
            }
          }
        })
    },
    _sendHdToCustodian(node) {
      let hdWallet = {
        data: {
          attributes: {
            version: '1',
            xpub: node.neutered().toBase58()
          },
          type: 'hd_wallet'
        }
      }

      this._createWallet('hd_wallets',
        hdWallet,
        [node],
        (address) => {
          return {
            data: {
              attributes: {
                address: address,
                path: []
              },
              type: 'hd_address'
            }
          }
        })
    },
    _sendPlainToCustodian(node) {
      let plainWallet = {
        data: {
          attributes: {
            version: '1'
          },
          type: 'plain_wallet'
        }
      }

      this._createWallet('plain_wallets',
        plainWallet,
        [node],
        (address) => {
          return {
            data: {
              attributes: { },
              id: node.getAddress(),
              type: 'address'
            }
          }
        })
    }
  }
}
