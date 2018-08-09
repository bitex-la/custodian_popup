import {Transaction} from './lib/transaction'
import * as bitcoin from 'bitcoinjs-lib'
import {showError, showSuccess, loading, notLoading} from './messages.js'
import {selectGroupism, buttonism, cardism} from './lib/bootstrapism.js'
import {updateEpidemic} from './lib/update_epidemic.js'
import {transactionService} from './services/transaction_service.js'
import networks from './lib/networks.js'
import config from './config'

var bip32 = require('bip32-path')
var _ = require('lodash')

window.bitcoin = bitcoin

export function signingHandler(){
  return {
    id: 'signing',
    $virus: updateEpidemic,
    _transactionJson: '',
    class: 'form',
    _rawtx: null,
    _rskAddress: '',
    $update(){
      let self = this
      if (self._rawtx){
        self.$build({
          class: 'jumbotron serialized-hex-tx',
          $type: 'textarea',
          cols: 100,
          $text: this._rawtx
        })
        self.$build({
          $type: 'button',
          class: 'button btn btn-primary btn-block mt-1',
          id: 'broadcast-transaction',
          $text: 'Broadcast Transaction',
          onclick() {
            config.nodeSelected = config._chooseBackUrl(self._networkName)
            transactionService(config).broadcast(self._rawtx).then((result) => {
              showSuccess('Transaction Broadcasted')
            })
          }
        })
      }
    },
    $$: [
      { $virus: selectGroupism('Network', _.keys(networks), 'bitcoin'),
        name: 'network',
        $update(){ this.value = this._networkName },
        onchange(e){ this._networkName = e.target.value }
      },
      { $tag: '.form-group textarea#tansaction_json.form-control',
        name: 'transaction_json',
        rows: 15,
        onchange(e){ this._transactionJson = e.target.value },
        $update(){
          this.$text = JSON.stringify(this._transactionJson, true, '  ')
        }
      },
      { $tag: 'button.btn.btn-primary.btn-block.mt-1',
        id: 'sign-transaction',
        $text: 'Sign transaction',
        _handleSigningResult(result){
          this._transactionJson = result.json
          this._rawtx = result.rawtx
          if(result.done){
            showSuccess("All signed, try to propagate rawtx")
          }
        },
        async onclick () {
          let transaction = new Transaction()
          let transactionJson = typeof(this._transactionJson) === "string" ? JSON.parse(this._transactionJson) : this._transactionJson
          try {
            let result = await transaction.signTransaction(transactionJson, this._networkName);
            this._handleSigningResult(result);
          } catch (error) {
            showError(error.json)
          }
        }
      }
    ]
  }
}

function exampleSpendAddressJson(){
  /*
  This transaction sends money from a regular (paytoaddress) address to itself.

	device_seed: 'custodian popup test'
  path: '0/1/2/3'
  address: 'mgYDL9xvE9bDAXQdWseNttP5V6iaRmBVZK'
  utxo: ['cb7ae6beaeda9591ec9be0d6de8d363e57d4a5f4dc4bf79a33fb6c942c09e02b', 0]
  https://testnet.blockexplorer.com/api/tx/cb7ae6beaeda9591ec9be0d6de8d363e57d4a5f4dc4bf79a33fb6c942c09e02b
  */
	return {
		outputs: [
			{ script_type: 'PAYTOADDRESS',
				address: 'mgYDL9xvE9bDAXQdWseNttP5V6iaRmBVZK',
				amount: 130000000
			}
		],
		inputs: [
			{ address_n: [0,1,2,3],
				prev_hash: 'cb7ae6beaeda9591ec9be0d6de8d363e57d4a5f4dc4bf79a33fb6c942c09e02b',
				prev_index: 0
			},
		],
		transactions: [
			{ hash: "cb7ae6beaeda9591ec9be0d6de8d363e57d4a5f4dc4bf79a33fb6c942c09e02b",
				version: 1,
				lock_time: 0,
				inputs: [
					{ prev_hash: "f52d8e97d39d0daa3d324c516a1e989975df74cc5ef6bdfa33e151310b22e176",
						prev_index: 1,
						sequence: 4294967295,
						script_sig: "160014b5cfcd65d0764a18ae74c583c2b341cb97335323" // HEX, not ASM.
					},
				],
				bin_outputs: [
					{ amount: 130000000,
						script_pubkey: "76a9140b3517e6562623042f7ae1fa9da19d3106841a8a88ac" // HEX, not ASM.
					},
					{ amount: 6922866917,
						script_pubkey: "a91490a8548f36918a89d39d7eb0a8c8b3f095478e8987" // HEX, not ASM.
					}
				]
			}
		]
	}
}

function exampleSpendMultisigJson(){
	/*
  This transaction sends money from a multisig address to itself.

	device seed: 'custodian popup test'
  path: '0/1/2/3'
  address: '2NFYkN6NcY7YV9gpEiahadmsT5h38t8hK99'
  utxo: ['c6199535c5e2bbf6437c87dfa4d8b6b16f6f9dae66eaa3205cb7044af974d6a8', 0]
  utxo_url: https://testnet.blockexplorer.com/api/tx/c6199535c5e2bbf6437c87dfa4d8b6b16f6f9dae66eaa3205cb7044af974d6a8
  root_extended_public_keys:
    x:
      xpub: 'xpub661MyMwAqRbcG9mRZW2tccfkuRxUoTuw4j2B5m1hYGEVfHDxaH5cdie93W2fr4TfMiP3Yss5pYywx3JWu166AEwE5vXD9HcXSHqWZvp7xkF'
    0:
      passphrase: 'one'
      xpub: 'tpubD6NzVbkrYhZ4YSh1zgHc1L2fNXQmSZM1FEbVFpNGzK9J1GDuhRnfoLUA7Unzq44qHVviVtyKdfLjnJYiuTUTjYAJt6Un4svFfRPb7m6TvZk'
    1:
      passphrase: 'two'
      xpub: 'tpubD6NzVbkrYhZ4YBZEKjx5MH2yTFykDGATeS6qJDwRSCz8PZp7jSd3TZKZzAaWz1CZxrupuTyDue7L3gxC62CMSvxobDZN6tF1q29vd2WroBm'
    2:
      passphrase: 'three'
      xpub: 'tpubD6NzVbkrYhZ4WsV7xWDG6J3oCpgai4uAmEu9A4RDq3hsmEJjaBKiKtNvpSQGQ4zFyC5KXiVd3pc6Q7DqJNPZ7oQUY2vvHPzUPo1R4cUqPqk'
	*/
	return {
		outputs: [
			{ script_type: 'PAYTOSCRIPTHASH',
				address: '2NFYkN6NcY7YV9gpEiahadmsT5h38t8hK99',
				amount: 64900000
			}
		],
		inputs: [
			{ address_n: [0,1,2,3],
				prev_hash: 'c6199535c5e2bbf6437c87dfa4d8b6b16f6f9dae66eaa3205cb7044af974d6a8',
				prev_index: 0,
				script_type: 'SPENDMULTISIG',
				multisig: {
					signatures: ['','',''],
					m: 2,
					pubkeys: [
						{ address_n: [0,1,2,3],
							node: {
								chain_code: 'd364df6dcc9820f950eac24ec69d93baafb5460125ff4c8e317fa6e4d986abef',
								depth: 0,
								child_num: 0,
								fingerprint: 0,
								public_key: '03fadcfdfe7f51a270b32f7b6b50b4f3a0110d25c9618671325032306718eb339e',
							}
						},
						{ address_n: [0,1,2,3],
							node: {
								chain_code: 'b92f6b8caa1b3200a4ea3f1e1f3ac04d79c4e403c3e720e41f709df2f9ea54b5',
								depth: 0,
								child_num: 0,
								fingerprint: 0,
								public_key: '02fc1a4e7dee10774671401869c55556559d675dfcb87b4ca0082ee29729329966',
							}
						},
						{ address_n: [0,1,2,3],
							node: {
								chain_code: '357308f6dc5518a1129d3cc21e9543e2e1e5cd14dc2b1304ce80b83af182beed',
								depth: 0,
								child_num: 0,
								fingerprint: 0,
								public_key: '02afe5d9f00ac1b2a1524327e4b4c53eeb59e0e76671820b5b1a1e53edf40e234f',
							}
						}
					]
				}
			}
		],
		transactions: [
			{ hash: "c6199535c5e2bbf6437c87dfa4d8b6b16f6f9dae66eaa3205cb7044af974d6a8",
				version: 1,
				lock_time: 0,
				inputs: [
					{ prev_hash: "3ef7f7ce2ecac486c65cbfd23fae143b87d5425f5ea13e47e257814b836eff7c",
						prev_index: 1,
						sequence: 4294967295,
						script_sig: "160014a7c94224a4e62aabf6da3360a62000d3c4e38d20" // HEX, not ASM.
					},
				],
				bin_outputs: [
					{ amount: 65000000,
						script_pubkey: "a914f4a331fa20dba4c41606f99482431e75664c5cf387" // HEX, not ASM.
					},
					{ amount: 7393167766,
						script_pubkey: "a914c2585ba5b2f3c27063b8f0a36e376eefcfcd4bff87" // HEX, not ASM.
					}
				]
			}
		]
	}
}

