import { hamlism } from "./lib/hamlism";
import { updateEpidemic } from "./lib/update_epidemic";
import { clearWalletModal } from './components/clear_wallet_modal';

export interface Address {
  publicAddress: string;
  path?: string;
  balance: number;
}

export class Wallet {
  id: string;
  type: string;
  attributes: {
    version: string;
    label: string;
    balance: number;
    xpub?: string;
    xpubs?: string[];
    signers?: number[];
  };
  addresses: Address[];

  prettyLabel(): string {
    let label = this.attributes.label;
    let splitWords = label.replace("_", " ");
    return this.titleCase(splitWords);
  }

  prettyType(): string {
    let type = this.type;
    let splitWords = type.replace("_", " ");
    return this.titleCase(splitWords);
  }

  private titleCase(str: string) {
    var splitStr = str.toLowerCase().split(" ");
    for (var i = 0; i < splitStr.length; i++) {
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ");
  }
}

export function walletHandler() {
  return {
    id: "wallets",
    $virus: [updateEpidemic, hamlism],
    class: "form",
    $$: [
      clearWalletModal(),
      {
        $tag: "ul.list-group.wallets-server.list-group-flush.mt-3",
        $update() {
          this.innerHTML = "";
          (<any>window)._.forEach(
            (<any>window).wallets,
            (rawWallet: Wallet) => {
              let wallet = Object.assign(new Wallet(), rawWallet);
              this.$build({
                $type: "div",
                $virus: hamlism,
                class: "list-group-item list-group-item flex-column",
                $$: [
                  {
                    $type: "div",
                    class: "d-flex w-100 justify-content-between",
                    $$: [
                      {
                        $type: "h4",
                        class: "mb-1",
                        $text: wallet.prettyLabel()
                      },
                      {
                        $type: "medium",
                        $text: `Balance: ${wallet.attributes.balance}`
                      }
                    ]
                  },
                  {
                    $type: "p",
                    class: "mb-1",
                    $text: wallet.prettyType()
                  },
                  {
                    $type: "div",
                    class: "d-flex w-100 justify-content-between",
                    $$: [
                      {
                        $type: "small",
                        class: "mb-1",
                        $$: [
                          {
                            $type: "b",
                            class: "mb-1",
                            $text: `Version: ${wallet.attributes.version}`
                          }
                        ]
                      },
                      {
                        $type: 'button',
                        class: 'btn btn-light',
                        "data-toggle": "modal",
                        "data-target": "#clearWalletModal",
                        $$: [
                          {
                            $type: 'span',
                            style: 'font-size: 24px',
                            $$: [
                              {
                                $type: "i",
                                class: "fas fa-share-square"
                              }
                            ]
                          }
                        ],
                        onclick() {
                          let modal = document.getElementById('clearWalletModal');
                          (<any> modal)._originWalletId = wallet.id;
                          let select = document.getElementById('chooseWalletModal');
                          select.innerHTML = "";
                          (<any> window).wallets.forEach((rawWallet: Wallet) => {
                            let wallet = Object.assign(new Wallet(), rawWallet);
                            let opt = document.createElement('option');
                            opt.value = wallet.id;
                            opt.innerHTML = wallet.prettyLabel();
                            select.appendChild(opt);
                          });
                        }
                      }
                    ]
                  }
                ]
              });
            }
          );
        }
      }
    ]
  };
}
