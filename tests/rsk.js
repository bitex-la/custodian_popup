import { Selector, RequestMock } from 'testcafe'
import { mockJQueryAjax } from './jquery.js'
import { mockTrezor } from './trezor.js'
import { mockWeb3 } from './web3_fake_provider.js'

fixture `Testing Rsk transactions`
  .page `http://localhost:9966`

test
  ('Creates and test a rsk transaction', async t => {

    mockTrezor(t);

    const selectNetwork = Selector('#multisig_setup_network');
    const nodeList = Selector('.hd-nodes')

    await t
      .click('a[href="#tab_multisig_setup"]')
      .click(selectNetwork)
      .click(selectNetwork.find('option').withText('rsk_testnet'))
      .click('button[data-id="add-node-from-trezor"]')
      .expect(nodeList.exists).ok()
      .expect(nodeList.textContent).contains('b5ae11144f988735aecf469b96b72f979736dbcc')
      .click('button[data-id="rsk-tx-creation"]')
      .expect(Selector('#from-address-rsk').value).contains('b5ae11144f988735aecf469b96b72f979736dbcc')
      .typeText('input[id="to-address-rsk"]', 'b4b3bbb8a149e9cddaa1ed6984942408e5b6a7ff')
      .typeText('input[id="amount-rsk"]', '11000000')
      .click('button[data-id="create-rsk-tx"]')
      .expect(Selector('#modalDialogRsk').exits).notOk()
  })
