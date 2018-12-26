import {
  Selector
} from 'testcafe'
import {
  mockTrezor
} from './trezor.js'

fixture(`Testing Signing`).page(`http://localhost:9966`)

test('Signs a bitcoin transaction (Testnet)', async t => {
  mockTrezor(t)

  const selectNetwork = Selector('select[name="network"]')

  let json = {
    'inputs': [
      ['', '435280c474ec92d056f17841e729cc0be0add93de538ee900028ab4147215f3b', 1, 1522000],
      ['', 'ebc5d54792b5baf24ea1de62f917c5b6d0f0090320a63e135e340f0aa48f1c27', 0, 100000]
    ],
    'trezor_inputs': [
      {
        'address_n': [44, 1, 0, 0],
        'prev_hash': '435280c474ec92d056f17841e729cc0be0add93de538ee900028ab4147215f3b',
        'prev_index': 1
      },
      {
        'address_n': [44, 1, 0, 0],
        'prev_hash': 'ebc5d54792b5baf24ea1de62f917c5b6d0f0090320a63e135e340f0aa48f1c27',
        'prev_index': 0
      }
    ],
    'trezor_outputs': [{
      'script_type': 'PAYTOADDRESS',
      'address': 'mreXn2qhKo7tnLnA2xCnBUSc1rC3W76FHG',
      'amount': 1622000
    }]
  }

  let json_expect = {
    'inputs': [
      ['', '435280c474ec92d056f17841e729cc0be0add93de538ee900028ab4147215f3b', 1, 1522000],
      ['', 'ebc5d54792b5baf24ea1de62f917c5b6d0f0090320a63e135e340f0aa48f1c27', 0, 100000]
    ],
    'trezor_inputs': [{
      'address_n': [44, 1, 0, 0],
      'prev_hash': '435280c474ec92d056f17841e729cc0be0add93de538ee900028ab4147215f3b',
      'prev_index': 1,
      'amount': '1522000',
      'script_type': 'SPENDADDRESS'
    }, {
      'address_n': [44, 1, 0, 0],
      'prev_hash': 'ebc5d54792b5baf24ea1de62f917c5b6d0f0090320a63e135e340f0aa48f1c27',
      'prev_index': 0,
      'amount': '100000',
      'script_type': 'SPENDADDRESS'
    }],
    'trezor_outputs': [{
      'script_type': 'PAYTOADDRESS',
      'address': 'mreXn2qhKo7tnLnA2xCnBUSc1rC3W76FHG',
      'amount': '1622000'
    }]
  }

  await t
    .click(selectNetwork)
    .click(selectNetwork.find('option').withText('Testnet'))
    .typeText(Selector('#transaction-json'), JSON.stringify(json), {
      replace: true
    })
    .click('button#sign-transaction')
    .expect(Selector('.serialized-hex-tx').textContent).contains('58e1b8b52e85d25c2566db3a5f39d26fdfd2849b9860e74a1b012f3b8a9b32c7')
    .expect(Selector('.json-hex-tx').textContent).contains(JSON.stringify(json_expect))
})
