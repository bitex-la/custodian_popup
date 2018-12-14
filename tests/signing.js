import {
  Selector
} from 'testcafe'

fixture(`Testing Signing`).page(`http://localhost:9966`)

test('Signs a bitcoin transaction (Testnet)', async t => {
  const selectNetwork = Selector('select[name="network"]')

  let json = {
    'trezor_inputs': [{
      'address_n': [44, 1, 0, 0],
      'prev_hash': '435280c474ec92d056f17841e729cc0be0add93de538ee900028ab4147215f3b',
      'prev_index': 1
    },
    {
      'address_n': [44, 1, 0, 0],
      'prev_hash': 'ebc5d54792b5baf24ea1de62f917c5b6d0f0090320a63e135e340f0aa48f1c27',
      'prev_index': 0
    }],
    'trezor_outputs': [{
      'script_type': 'PAYTOADDRESS',
      'address': 'mreXn2qhKo7tnLnA2xCnBUSc1rC3W76FHG',
      'amount': 1622000
    }]
  }

  await t
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('Testnet'))
    .typeText(Selector('#tansaction_json'), JSON.stringify(json), {
      replace: true
    })
    .click('button#sign-transaction')
})
