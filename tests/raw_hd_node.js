import { Selector } from 'testcafe'
import { mockJQueryAjax } from './jquery.js'

fixture(`Getting Started`).page(`http://localhost:9966`)

test('Check navbar', async t => {
  await t.expect(Selector('.nav-item:first-child a').innerText).eql('Signing')
  await t.expect(Selector('.nav-item:nth-child(2) a').innerText).eql('Multisig setup')
  await t.expect(Selector('.nav-item:nth-child(3) a').innerText).eql('Load device')
  await t.expect(Selector('.nav-item:nth-child(4) a').innerText).eql('Debugger')
  await t.expect(Selector('.nav-item:nth-child(5) a').innerText).eql('Wallets')
})

test('Creates a Raw Hd Node', async t => {
  mockJQueryAjax(t, (params, ajaxResponse) => {
    let hdWallet = {
      attributes: {
        version: 1,
        xpub: 'tpubD6NzVbkrYhZ4YSh1zgHc1L2fNXQmSZM1FEbVFpNGzK9J1GDuhRnfoLUA7Unzq44qHVviVtyKdfLjnJYiuTUTjYAJt6Un4svFfRPb7m6TvZk'
      },
      id: '123',
      type: 'hd_wallet'
    }

    if (params.method === 'POST' && /hd_wallets/.test(params.url)) {
      return ajaxResponse({data: hdWallet})
    } else if (params.method === 'GET' && /hd_wallets\/123\/relationships\/addresses/.test(params.url)) {
      return ajaxResponse({data: [{attributes: {address: 'mxZpWbpSVtJoLHU2ZSC75VTteKc4F7RkTn'}}]})
    } else if (params.method === 'GET' && /hd_wallets\/123\/get_utxos\?since=0&limit=1000/.test(params.url)) {
      return ajaxResponse({
        data: [{
          attributes: {
            transaction: {
              satoshis: 123000,
              transaction_hash: 'hash456',
              position: 0
            },
            address: {
              path: []
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
              path: []
            }
          }
        }
        ]
      })
    } else if (params.method === 'GET' && /hd_wallets/.test(params.url)) {
      return ajaxResponse({data: [hdWallet]})
    } else if (params.method === 'GET' && /estimatefee/.test(params.url)) {
      return ajaxResponse({2: '0.00001000'})
    }
  })

  const selectNetwork = Selector('#multisig_setup_network')
  const nodeList = Selector('.hd-nodes')
  const selectNetworkWallet = Selector('#wallets select[name="network"]')
  const selectWallet = Selector('#wallets select[name="wallet_type"]')
  const selectScriptType = Selector('select[name="script_type"]')

  await t
    .click('a[href="#tab_multisig_setup"]')
    .typeText('#multisig_setup_xpub', 'tpubD6NzVbkrYhZ4YSh1zgHc1L2fNXQmSZM1FEbVFpNGzK9J1GDuhRnfoLUA7Unzq44qHVviVtyKdfLjnJYiuTUTjYAJt6Un4svFfRPb7m6TvZk')
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('testnet'))
    .click('.add-node-group > button')
    .expect(nodeList.exists).ok()
    .expect(nodeList.textContent).contains('mxZpWbpSVtJoLHU2ZSC75VTteKc4F7RkTn')
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
    .expect(Selector('#tansaction_json').textContent).contains('"script_type": "PAYTOADDRESS",\n      "address": "mgYDL9xvE9bDAXQdWseNttP5V6iaRmBVZK",\n      "amount": 569000')
})
