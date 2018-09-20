import { Selector } from 'testcafe'
import { mockTrezor } from './trezor.js'
import { mockJQueryAjax } from './jquery.js'

fixture(`Testing Rsk transactions`).page(`http://localhost:9966`)

test('Creates and test a rsk transaction', async t => {
  mockTrezor(t)

  mockJQueryAjax(t, (params, ajaxResponse) => {
    if (params.method === 'GET' && /estimatefee/.test(params.url)) {
      return ajaxResponse({2: '0.00001000'})
    } else if (params.method === 'POST' && /transactions\/broadcast/.test(params.url)) {
      return ajaxResponse(null)
    } else if (params.method === 'GET' && /balance/.test(params.url)) {
      return ajaxResponse('1000000000000')
    } else if (params.method === 'GET' && /plain_wallets\/relationships\/addresses\/0\/get_utxos\?since=0&limit=1000000/.test(params.url)) {
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
              address: 'mxZpWbpSVtJoLHU2ZSC75VTteKc4F7RkTn'
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
              address: 'mxZpWbpSVtJoLHU2ZSC75VTteKc4F7RkTn'
            }
          }
        }
        ]
      })
    }
  })

  const selectNetwork = Selector('#setup_network')

  await t
    .click('a[href="#tab_rsk"]')
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('Testnet'))
    .click('button[data-id="get-address-rsk"]')
    .expect(Selector('#badge-rsk-balance').textContent).eql('1000000000000000')
    .expect(Selector('#badge-btc-balance').textContent).eql('1000000000000')
    .typeText('input[id="amount-rsk"]', '123456789')
    .typeText('input[id="amount-btc"]', '675391872')
    .click(Selector('#is-btc-peg'))
    .click(Selector('#is-rsk-peg'))
    .expect(Selector('#destination-rsk-address').value).eql('0x0000000000000000000000000000000001000006')
    .expect(Selector('#destination-btc-address').value).eql('2MyYqLW8mQHgKtBCqnkaKofRRp2BXCF6B4B')
    .click(Selector('#send-btc'))
    .click(Selector('#send-rsk'))
    .expect(Selector('body').textContent).contains('Transaction hash')
    .typeText('input[id="amount-btc"]', '67539187298798798797')
    .click(Selector('#send-btc'))
    .expect(Selector('body').textContent).contains('The amount is less than allowed')
})

test('Does not allow the creation of a rsk transaction with less money that allowed', async t => {
  mockTrezor(t)

  mockJQueryAjax(t, (params, ajaxResponse) => {
    if (params.method === 'GET' && /balance/.test(params.url)) {
      return ajaxResponse('1000000000000')
    } else if (params.method === 'GET' && /plain_wallets\/relationships\/addresses\/0\/get_utxos\?since=0&limit=1000000/.test(params.url)) {
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
              address: 'mxZpWbpSVtJoLHU2ZSC75VTteKc4F7RkTn'
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
              address: 'mxZpWbpSVtJoLHU2ZSC75VTteKc4F7RkTn'
            }
          }
        }
        ]
      })
    }
  })

  const selectNetwork = Selector('#setup_network')

  await t
    .click('a[href="#tab_rsk"]')
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('Testnet'))
    .click('button[data-id="get-address-rsk"]')
    .typeText('input[id="amount-rsk"]', '67539187298798798797')
    .click(Selector('#send-rsk'))
    .expect(Selector('body').textContent).contains('The amount is less than allowed')
})
