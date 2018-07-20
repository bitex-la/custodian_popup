import { ClientFunction } from 'testcafe'
import fs from 'fs'

export async function mockTrezor(t) {

  var clientFunction = ClientFunction(() => {
    window.$trezor = { 
      DeviceList: function(configUrl) {
        return {
          removeListener: function (name, callback) { },
          on: function (name, callback) { name === 'transport' ? callback() : callback },
          hasDeviceOrUnacquiredDevice: function () {
            return true
          },
          acquireFirstDevice: function (bool) {
            return new Promise((resolve, reject) => {
              resolve({ device: { features: { major_version: 1000, minor_version: 100, patch_version: 100  } }, 
                        session: {
                          on: function (name, callback) {  },
                          getPublicKey: function (path) { return new Promise((resolve, reject) => { 
                            resolve({ message: { xpub: 'tpubD6NzVbkrYhZ4YSh1zgHc1L2fNXQmSZM1FEbVFpNGzK9J1GDuhRnfoLUA7Unzq44qHVviVtyKdfLjnJYiuTUTjYAJt6Un4svFfRPb7m6TvZk' } }) })
                          },
                          signTx: function (inputs, outputs, transactions, coin) { return new Promise((resolve, reject) => {
                            resolve({
                              message: {
                                serialized: {
                                  serialized_tx: '000serializedTx',
                                  signatures: ['1', '2', '3']
                                }
                              }
                            })
                          }) }
                        }
                     })
              return new Promise(function (resolve, reject) {  })
            }).catch(function () {  })
          }
        }
      }
    }
  })

  await clientFunction()
}
