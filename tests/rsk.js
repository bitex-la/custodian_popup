import { Selector } from 'testcafe'
import { mockTrezor } from './trezor.js'
import { mockJQueryAjax } from './jquery.js'

fixture(`Testing Rsk transactions`).page(`http://localhost:9966`)

function _mockJQueryAjax (t) {
  mockJQueryAjax(t, (params, ajaxResponse) => {
    if (params.method === 'GET' && /estimatefee/.test(params.url)) {
      return ajaxResponse({2: '0.00001000'})
    } else if (params.method === 'POST' && /transactions\/broadcast/.test(params.url)) {
      return ajaxResponse('58e1b8b52e85d25c2566db3a5f39d26fdfd2849b9860e74a1b012f3b8a9b32c7')
    } else if (params.method === 'GET' && /balance/.test(params.url)) {
      return ajaxResponse('1000000000000')
    } else if (params.method === 'GET' && /get_utxos\?since=0&limit=1000000/.test(params.url)) {
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
}

test('Creates and test a rsk transaction', async t => {
  mockTrezor(t)
  _mockJQueryAjax(t)

  const selectNetwork = Selector('#setup_network')

  await t
    .click('a[href="#tab_rsk"]')
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('Testnet'))
    .click('button[data-id="get-address-rsk"]')
    .expect(Selector('#badge-rsk-balance').textContent).eql('0')
    .expect(Selector('#badge-btc-balance').textContent).eql('1000000000000')
    .typeText('input[id="amount-rsk"]', '786101')
    .typeText('input[id="amount-btc"]', '675391872')
    .click(Selector('#is-btc-peg'))
    .click(Selector('#is-rsk-peg'))
    .expect(Selector('#destination-rsk-address').value).eql('0x0000000000000000000000000000000001000006')
    .expect(Selector('#destination-btc-address').value).eql('2N1N5mdHWmRUfv49f7GnUeFfuyLcBQK7hj2')
    .click(Selector('#send-btc'))
    .click(Selector('#send-rsk'))
    .expect(Selector('body').textContent).contains('Transaction hash')
    .expect(Selector('#amount-btc').value).eql('')
    .expect(Selector('#destination-btc-address').value).eql('')
    .expect(Selector('#origin-btc-address').value).eql('')
})

test('Does not allow the creation of a transaction with less money that allowed', async t => {
  mockTrezor(t)
  _mockJQueryAjax(t)

  const selectNetwork = Selector('#setup_network')

  await t
    .click('a[href="#tab_rsk"]')
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('Testnet'))
    .click('button[data-id="get-address-rsk"]')
    .typeText('input[id="amount-rsk"]', '67539187298798798797')
    .click(Selector('#send-rsk'))
    .expect(Selector('body').textContent).contains('The amount is less than allowed')
    .typeText('input[id="amount-btc"]', '67539187298798798797')
    .click(Selector('#send-btc'))
    .expect(Selector('body').textContent).contains('The amount is less than allowed')
})

test('Does not allow transactions over invalid addresses', async t => {
  mockTrezor(t)
  _mockJQueryAjax(t)

  const selectNetwork = Selector('#setup_network')

  await t
    .click('a[href="#tab_rsk"]')
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('Testnet'))
    .click('button[data-id="get-address-rsk"]')
    .typeText('input[id="amount-rsk"]', '786101')
    .typeText('input[id="destination-rsk-address"]', '12345678b90')
    .click(Selector('#send-rsk'))
    .expect(Selector('body').textContent).contains('Error: Provided address "12345678b90" is invalid')
    .typeText('input[id="destination-btc-address"]', '9876544332')
    .click(Selector('#send-btc'))
    .expect(Selector('body').textContent).contains('Invalid parameters: Invalid Testnet output address 9876544332')
})

test('Throws an error when network is wrong', async t => {
  mockTrezor(t)
  _mockJQueryAjax(t)

  const selectNetwork = Selector('#setup_network')

  await t
    .click('a[href="#tab_rsk"]')
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('Testnet'))
    .click('button[data-id="conf-modal-button"]')
    .selectText('input[id="url-conf-rsk-testnet"]')
    .pressKey('delete')
    .typeText('input[id="url-conf-rsk-testnet"]', 'aaa')
    .click('button[data-id="set-conf"]')
    .click('button[data-id="get-address-rsk"]')
    .expect(Selector('body').textContent).contains("Error: CONNECTION ERROR: Couldn't connect to node aaa.")
})
