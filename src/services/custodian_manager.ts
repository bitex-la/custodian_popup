import { WalletService } from './wallet_service'
import { showError, showInfo } from '../messages'
import { Config } from '../config';

interface Node {
  getAddress: () => string,
  neutered: () => {
    toBase58: () => string
  }
}

interface Error {
  statusText: string,
}

interface Wallet {
  _hdNodes: Node[],
  _required: string
}

export function CustodianManager (config: Config) {
  return {
    _createWallet (type: string, wallet: string, hdNodes: Node[], buildAddress: (address: string) => string) {
      WalletService(config).create(`/${type}`, wallet)
        .then(
          (walletResponse: { data: { id: string }}) => {
            (<any> window)._.forEach(hdNodes, (node: Node) => {
              let address = buildAddress(node.getAddress())
              WalletService(config).create(`/${type}/${walletResponse.data.id}/relationships/addresses`,
                address).then(() => showInfo(`Address saved`)).catch((error: Error) => showError(error.statusText))
            });
            showInfo('Wallet saved');
          })
        .catch((error: Error) => showError(error.statusText))
    },
    _sendMultisigToCustodian (wallet: Wallet) {
      let xpubs = (<any> window)._.map(wallet._hdNodes, (node: Node) => node.neutered().toBase58());

      let multisigWallet = {
        data: {
          attributes: {
            version: wallet._hdNodes.length.toString(),
            xpubs: xpubs,
            signers: parseInt(wallet._required)
          },
          type: 'multisig_wallet'
        }
      }

      this._createWallet('multisig_wallets',
        multisigWallet,
        wallet._hdNodes,
        (address: string) => {
          return {
            data: {
              attributes: {
                address: address,
                path: (<number[]> [])
              },
              type: 'hd_address'
            }
          }
        })
    },
    _sendHdToCustodian (node: Node) {
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
        (address: string) => {
          return {
            data: {
              attributes: {
                address: address,
                path: (<number[]> [])
              },
              type: 'hd_address'
            }
          }
        })
    },
    _sendPlainToCustodian (node: Node) {
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
        (address: string) => {
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
