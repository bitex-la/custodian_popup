import { Selector } from 'testcafe'
import { mockJQueryAjax } from './jquery.js'
import { mockTrezor } from './trezor.js'

fixture(`Testing Hd Wallet`).page(`http://localhost:9966`)

test('Creates a Trezor Hd Node', async t => {
  mockTrezor(t)

  mockJQueryAjax(t, (params, ajaxResponse) => {
    let hdWallet = {
      attributes: {
        version: 1,
        label: 'hdwallet',
        xpub: 'tpubD6NzVbkrYhZ4YSh1zgHc1L2fNXQmSZM1FEbVFpNGzK9J1GDuhRnfoLUA7Unzq44qHVviVtyKdfLjnJYiuTUTjYAJt6Un4svFfRPb7m6TvZk'
      },
      id: '123',
      type: 'hd_wallet'
    }

    if (params.method === 'POST' && /hd_wallets/.test(params.url)) {
      return ajaxResponse({data: hdWallet})
    } else if (params.method === 'POST' && /hd_addresses/.test(params.url)) {
      return ajaxResponse({data: [{attributes: {public_address: 'mxZpWbpSVtJoLHU2ZSC75VTteKc4F7RkTn'}}]})
    } else if (params.method === 'GET' && /hd_addresses\?wallet_id=123/.test(params.url)) {
      return ajaxResponse({data: [{attributes: {public_address: 'mxZpWbpSVtJoLHU2ZSC75VTteKc4F7RkTn'}}]})
    } else if (params.method === 'GET' && /hd_wallets\/123\/get_utxos\?since=0&limit=1000000/.test(params.url)) {
      return ajaxResponse({
        data: [{
          attributes: {
            transaction: {
              satoshis: 123000,
              transaction_hash: 'hash456',
              position: 0
            },
            address: {
              path: [],
              public_address: 'mxZpWbpSVtJoLHU2ZSC75VTteKc4F7RkTn'
            }
          }
        },
        {
          attributes: {
            transaction: {
              satoshis: 789000,
              transaction_hash: 'hash652',
              position: 1
            },
            address: {
              path: [],
              public_address: 'mxZpWbpSVtJoLHU2ZSC75VTteKc4F7RkTn'
            }
          }
        }]
      })
    } else if (params.method === 'GET' && /plain_addresses\/(.*)\/get_utxos\?since=0&limit=1000000/.test(params.url)) {
      return ajaxResponse({
        data: [{
          attributes: {
            satoshis: 123000,
            transaction_hash: 'hash456',
            position: 0
          }
        },
        {
          attributes: {
            satoshis: 789000,
            transaction_hash: 'hash456',
            position: 0
          }
        }]
      })
    } else if (params.method === 'GET' && /hd_wallets/.test(params.url)) {
      return ajaxResponse({data: [hdWallet]})
    } else if (params.method === 'GET' && /estimatefee/.test(params.url)) {
      return ajaxResponse({2: '0.00001000'})
    } else if (params.method === 'POST' && /transactions\/broadcast/.test(params.url)) {
      return ajaxResponse(null)
    } else if (params.method === 'GET' && /balance/.test(params.url)) {
      return ajaxResponse('10000')
    }
  })

  const selectNetwork = Selector('#multisig_setup_network')
  const nodeList = Selector('.hd-nodes')
  const selectNetworkWallet = Selector('#wallets select[name="network"]')
  const selectWallet = Selector('#wallets select[name="wallet_type"]')
  const selectScriptType = Selector('select[name="script_type"]')

  await t
    .click('a[href="#tab_multisig_setup"]')
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('testnet'))
    .click('button[data-id="add-node-from-trezor"]')
    .expect(nodeList.exists).ok()
    .expect(nodeList.textContent).contains('mxZpWbpSVtJoLHU2ZSC75VTteKc4F7RkTn')
    .expect(Selector('#balance-mxZpWbpSVtJoLHU2ZSC75VTteKc4F7RkTn').textContent).contains('10000')
    .click('button[data-id="hd-wallet-creation"]')
    .click('a[href="#tab_wallets"]')
    .click(selectNetworkWallet)
    .click(selectNetworkWallet.find('option').withText('testnet'))
    .click(selectWallet)
    .click(selectWallet.find('option').withText('Hd'))
    .expect(Selector('.wallets-table').textContent).contains('tpubD6NzVb')
    .click('button[data-id="show-addresses"]')
    .expect(Selector('.addresses-table').textContent).contains('mxZpWbpSVtJoLHU2ZSC75VTteKc4F7RkTn')
    .click('button[data-id="create-transaction"]')
    .expect(Selector('input[id="amount"]').value).eql('912000')
    .click(selectScriptType)
    .click(selectScriptType.find('option').withText('PAYTOADDRESS'))
    .typeText('input[name="address"]', 'mgYDL9xvE9bDAXQdWseNttP5V6iaRmBVZK')
    .click('button[data-id="add-output-tx"]')
    .expect(Selector('.table-outputs-tx').textContent).contains('912000')
    .expect(Selector('input[name="amount"]').value).eql('0')
    .click('button[data-id="create-tx"]')
    .expect(Selector('#tansaction_json').textContent).contains('"script_type":"PAYTOADDRESS","address":"mgYDL9xvE9bDAXQdWseNttP5V6iaRmBVZK","amount":569000')
    .click('button#sign-transaction')
    .expect(Selector('.serialized-hex-tx').textContent).contains('58e1b8b52e85d25c2566db3a5f39d26fdfd2849b9860e74a1b012f3b8a9b32c7')
    .click('button#broadcast-transaction')
    .expect(Selector('.messages').textContent).contains('Transaction Broadcasted')
    .typeText('textarea#tansaction_json', '""')
    .click('a[href="#tab_wallets"]')
    .click('button[data-id="create-address-transaction"]')
    .click('button.del-utxo')
    .expect(Selector('input[id="amount"]').value).eql('912000')
    .click(selectScriptType)
    .click(selectScriptType.find('option').withText('PAYTOADDRESS'))
    .click('button[data-id="add-output-tx"]')
    .expect(Selector('.table-outputs-tx').textContent).contains('912000')
    .expect(Selector('input[name="amount"]').value).eql('0')
    .click('button[data-id="create-tx"]')
    .expect(Selector('#tansaction_json').textContent).contains('"script_type":"PAYTOADDRESS","address":"mgYDL9xvE9bDAXQdWseNttP5V6iaRmBVZK","amount":569000')
    .click('button#sign-transaction')
    .expect(Selector('.serialized-hex-tx').textContent).contains('58e1b8b52e85d25c2566db3a5f39d26fdfd2849b9860e74a1b012f3b8a9b32c7')
    .click('button#broadcast-transaction')
    .expect(Selector('.messages').textContent).contains('Transaction Broadcasted')
})
