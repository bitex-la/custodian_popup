import {
  Selector
} from 'testcafe'
import {
  mockTrezor
} from './trezor.js'

fixture(`Testing Signing`).page(`http://localhost:9966`)

test('Signs a bitcoin transaction (Testnet)', async t => {
  mockTrezor(t)

  const selectNetwork = Selector('select[id="multisig_setup_network"]')
  const nodeList = Selector('.hd-nodes')

  await t
    .click('a[href="#tab_multisig_setup"]')
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('Testnet'))
    .click('button[data-id="add-node-from-trezor"]')
    .expect(nodeList.exists).ok()
    .expect(nodeList.textContent).contains('mgYDL9xvE9bDAXQdWseNttP5V6iaRmBVZK')
})
