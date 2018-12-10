import { Selector } from 'testcafe'

fixture(`Testing Signing`).page(`http://localhost:9966`)

test('Signs a bitcoin transaction (Testnet)', async t => {

  const selectNetwork = Selector('select[name="network"]')

  await t
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('Testnet'))
    .typeText(Selector('#tansaction_json'), 'Hola', { replace: true })
    .click('button#sign-transaction')
})
