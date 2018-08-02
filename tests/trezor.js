import { ClientFunction } from 'testcafe'
import trezor from 'mock-trezor'

export async function mockTrezor(t) {
  var clientFunction = ClientFunction((trezor) => window.TrezorConnect = trezor )
  await clientFunction(trezor)
}
