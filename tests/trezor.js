import { ClientFunction } from 'testcafe'
import fs from 'fs'

export async function mockTrezor(t) {

  var clientFunction = ClientFunction(() => {
    device.run = (callback) => {
      new Promise((resolve, reject) => {
        resolve(callback)
      })
    }
  })

  clientFunction()
}
