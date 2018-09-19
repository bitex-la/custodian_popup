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
      return ajaxResponse('10000')
    }
  })

  const selectNetwork = Selector('#setup_network')

  await t
    .click('a[href="#tab_rsk"]')
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('Testnet'))
    .click('button[data-id="get-address-rsk"]')
    .expect(Selector('#badge-rsk-balance').textContent).eql('1000000000000000')
    .expect(Selector('#badge-btc-balance').textContent).eql('10000')
    .typeText('input[id="amount-rsk"]', '123456789')
    .typeText('input[id="amount-btc"]', '675391872')
})
