import { Selector, RequestMock } from 'testcafe'
import { mockJQueryAjax } from './jquery.js'

fixture `Getting Started`
    .page `http://localhost:9966`

test('Check navbar', async t => {
    await t.expect(Selector('.nav-item:first-child a').innerText).eql('Signing')
    await t.expect(Selector('.nav-item:nth-child(2) a').innerText).eql('Multisig setup')
    await t.expect(Selector('.nav-item:nth-child(3) a').innerText).eql('Load device')
    await t.expect(Selector('.nav-item:nth-child(4) a').innerText).eql('Debugger')
    await t.expect(Selector('.nav-item:nth-child(5) a').innerText).eql('Wallets')
})

test
  ('Creates a Node', async t => {
    const selectNetwork = Selector('#multisig_setup_network')
    const nodeList = Selector('.hd-nodes')

    const selectWallet = Selector('#wallets select')

    mockJQueryAjax(t, (params, ajaxResponse) => {
      let hdWallet = { attributes: { version: 1, 
        xpub: 'tpubD6NzVbkrYhZ4YSh1zgHc1L2fNXQmSZM1FEbVFpNGzK9J1GDuhRnfoLUA7Unzq44qHVviVtyKdfLjnJYiuTUTjYAJt6Un4svFfRPb7m6TvZk' },
        id: '123', type: 'hd_wallet' }

      if (params.method === 'POST' && /hd_wallets/.test(params.url)) {
        return ajaxResponse({data: hdWallet})
      } else if (params.method === 'GET' && /hd_wallets/.test(params.url)) {
        return ajaxResponse({data: [hdWallet]})
      }
    })

    await t
      .click('a[href="#tab_multisig_setup"]')
      .typeText('#multisig_setup_xpub', 'tpubD6NzVbkrYhZ4YSh1zgHc1L2fNXQmSZM1FEbVFpNGzK9J1GDuhRnfoLUA7Unzq44qHVviVtyKdfLjnJYiuTUTjYAJt6Un4svFfRPb7m6TvZk')
      .click(selectNetwork)
      .click(selectNetwork.find('option').withText('testnet'))
      .click('.add-node-group > button')
      .expect(nodeList.exists).ok()
      .expect(nodeList.textContent).contains('mxZpWbpSVtJoLHU2ZSC75VTteKc4F7RkTn')
      .click('.wallet-creation > button')
      .click('a[href="#tab_wallets"]')
      .click(selectWallet)
      .click(selectWallet.find('option').withText('Hd'))
      .expect(Selector('.wallets-table').textContent).contains('tpubD6NzVb')
})