import { WalletService } from "./wallet_service";
import { showError, showInfo } from "../messages";
import { Config } from "../config";

interface Node {
  getAddress: () => string;
  neutered: () => {
    toBase58: () => string;
  };
}

interface Error {
  statusText: string;
}

interface Wallet {
  _hdNodes: Node[];
  _required: string;
}

export function CustodianManager(config: Config) {
  return {
    _createWallet(
      type: string,
      addressType: string,
      wallet: string,
      hdNodes: Node[],
      buildAddress: (id: string, address: string) => string
    ) {
      WalletService(config)
        .create(`/${type}`, wallet)
        .then((walletResponse: { data: { id: string } }) => {
          (<any>window)._.forEach(hdNodes, (node: Node) => {
            let address = buildAddress(
              walletResponse.data.id,
              node.getAddress()
            );
            WalletService(config)
              .create(`/${addressType}`, address)
              .then(() => showInfo(`Address saved`))
              .catch((error: Error) => showError(error.statusText));
          });
          showInfo("Wallet saved");
        })
        .catch((error: Error) => showError(error.statusText));
    },

    _sendMultisigToCustodian(wallet: Wallet) {
      let xpubs = (<any>window)._.map(wallet._hdNodes, (node: Node) =>
        node.neutered().toBase58()
      );

      let multisigWallet = {
        data: {
          attributes: {
            version: wallet._hdNodes.length.toString(),
            label: "multisig",
            xpubs: xpubs,
            signers: parseInt(wallet._required)
          },
          type: "multisig_wallets"
        }
      };

      this._createWallet(
        "multisig_wallets",
        "multisig_addresses",
        multisigWallet,
        wallet._hdNodes,
        (id: string, address: string) => {
          return this._createMultisigAddress(address, id);
        }
      );
    },

    _sendHdToCustodian(node: Node) {
      let hdWallet = {
        data: {
          attributes: {
            version: "1",
            label: "hd",
            xpub: node.neutered().toBase58()
          },
          type: "hd_wallets"
        }
      };

      this._createWallet(
        "hd_wallets",
        "hd_addresses",
        hdWallet,
        [node],
        (id: string, address: string) => {
          return this._createHdAddress(address, id);
        }
      );
    },
    _sendPlainToCustodian(node: Node) {
      let plainWallet = {
        data: {
          attributes: {
            label: "plain",
            version: "1"
          },
          type: "plain_wallets"
        }
      };

      this._createWallet(
        "plain_wallets",
        "plain_addresses",
        plainWallet,
        [node],
        (id: string, address: string) => {
          return this._createPlainAddress(address, id);
        }
      );
    },

    _createMultisigAddress(value: string, walletLabel: string) {
      return {
        data: {
          attributes: {
            public_address: value,
            path: <number[]>[]
          },
          relationships: {
            wallet: {
              data: {
                type: "multisig_wallets",
                id: walletLabel
              }
            }
          },
          type: "multisig_addresses"
        }
      };
    },

    _createHdAddress(value: string, walletLabel: string) {
      return {
        data: {
          attributes: {
            public_address: value,
            path: <number[]>[]
          },
          relationships: {
            wallet: {
              data: {
                type: "hd_wallets",
                id: walletLabel
              }
            }
          },
          type: "hd_addresses"
        }
      };
    },

    _createPlainAddress(value: string, walletLabel: string) {
      return {
        data: {
          attributes: {},
          public_address: value,
          relationships: {
            wallet: {
              data: {
                type: "plain_wallets",
                id: walletLabel
              }
            }
          },
          type: "plain_addresses"
        }
      };
    }
  };
}
