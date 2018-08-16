import { Selector } from 'testcafe'
import { mockTrezor } from './trezor.js'

fixture(`Testing Rsk transactions`).page(`http://localhost:9966`)

test('Creates and test a rsk transaction', async t => {
  mockTrezor(t)

  const selectNetwork = Selector('#setup_network')

  await t
    .click('a[href="#tab_rsk"]')
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('Testnet'))
    .click('button[data-id="rsk-tx-creation"]')
    .typeText('input[id="from-address-rsk"]', 'b5ae11144f988735aecf469b96b72f979736dbcc')
    .expect(Selector('#to-address-rsk').value).contains('0x0000000000000000000000000000000001000006')
    .typeText('input[id="amount-rsk"]', '11000000')
    .click('button[data-id="create-rsk-modal-tx"]')
    .expect(Selector('#modalDialogRsk').exits).notOk()
})
