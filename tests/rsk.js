import { Selector } from 'testcafe'
import { mockTrezor } from './trezor.js'

fixture(`Testing Rsk transactions`).page(`http://localhost:9966`)

test('Creates and test a rsk transaction', async t => {
  mockTrezor(t)

  const selectNetwork = Selector('#setup_network')
  const selectPath = Selector('#derivation_path')

  await t
    .click('a[href="#tab_rsk"]')
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('Testnet'))
    .click('button[data-id="rsk-tx-creation"]')
    .click('button[data-id="add-address-from-trezor"]')
    .click(selectPath)
    .click(selectPath.find('option').withText("Testnet m/44'/1'/0'/0'/0"))
    .click('button[data-id="create-rsk-tx"]')
    .typeText('input[id="from-address-rsk"]', '0xb5ae11144f988735aecf469b96b72f979736dbcc')
    .expect(Selector('#to-address-rsk').value).contains('0x0000000000000000000000000000000001000006')
    .click('button[data-id="create-rsk-modal-tx"]')
    .expect(Selector('#modalDialogRsk').exits).notOk()
    .click('button[data-id="rsk-tx-creation-sbtc"]')
    .click('button[data-id="add-address-from-trezor"]')
    .click(selectPath)
    .click(selectPath.find('option').withText("Testnet m/44'/1'/0'/0'/0"))
    .click('button[data-id="create-rsk-tx"]')
    .typeText('input[id="to-address-rsk"]', '0x92ca912e41f9659b86f3147ef6f5abd6e93658df')
    .click('button[data-id="add-balance"]')
    .expect(Selector('#amount-rsk').value).eql('1000000000000000')
    .click('button[data-id="create-rsk-modal-tx"]')
    .expect(Selector('#modalDialogRsk').exits).notOk()
})
