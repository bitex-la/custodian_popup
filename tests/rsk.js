import { Selector } from 'testcafe'
import { mockTrezor } from './trezor.js'
import { mockXmlHttpRequest } from './xmlHttpRequest.js'

// const mock = RequestMock().onRequestTo(request => {
//   return /mycrypto/.test(request.url) &&
//          request.method === 'POST' &&
//          request.body === '{"jsonrpc":"2.0","id":7,"method":"eth_getBalance","params":["0xb5ae11144f988735aecf469b96b72f979736dbcc","latest"]}' &&
//          request.headers['content-type'] === 'application/json'
// }).respond('20000')

// const mock = RequestMock().onRequestTo(/mycrypto/).respond((req, res) => {
//   res.headers['Access-Control-Allow-Origin'] = '*'
//   res.statusCode = '200'
//   res.setBody("{'jsonrpc': '2.0', 'id': 2, 'result': '0x4E20'}")
// })

fixture(`Testing Rsk transactions`).page(`http://localhost:9966`)

test('Creates and test a rsk transaction', async t => {
  mockTrezor(t)
  mockXmlHttpRequest(t)

  const selectNetwork = Selector('#setup_network')
  const selectPath = Selector('#derivation_path')

  await t
    .click('a[href="#tab_rsk"]')
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('Testnet'))
    .click('button[data-id="rsk-tx-creation"]')
    .typeText('input[id="from-address-rsk"]', '0xb5ae11144f988735aecf469b96b72f979736dbcc')
    .expect(Selector('#to-address-rsk').value).contains('0x0000000000000000000000000000000001000006')
    .typeText('input[id="amount-rsk"]', '11000000')
    .click('button[data-id="create-rsk-modal-tx"]')
    .click(selectPath)
    .click(selectPath.find('option').withText("Testnet m/44'/1'/0'/0'/0"))
    .click('button[data-id="create-rsk-tx"]')
    .click('button[data-id="create-rsk-modal-tx"]')
    .expect(Selector('#modalDialogRsk').exits).notOk()
    .click('button[data-id="rsk-tx-creation-sbtc"]')
    .typeText('input[id="from-address-rsk"]', '0xb5ae11144f988735aecf469b96b72f979736dbcc')
    .typeText('input[id="to-address-rsk"]', '0x92ca912e41f9659b86f3147ef6f5abd6e93658df')
    .click('button[data-id="add-balance"]')
    .click('button[data-id="create-rsk-modal-tx"]')
    .click(selectPath)
    .click(selectPath.find('option').withText("Testnet m/44'/1'/0'/0'/0"))
    .click('button[data-id="create-rsk-tx"]')
    .click('button[data-id="create-rsk-modal-tx"]')
    .expect(Selector('#modalDialogRsk').exits).notOk()
})
