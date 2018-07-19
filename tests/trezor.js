import { ClientFunction } from 'testcafe'
import fs from 'fs'

export async function mockTrezor(t) {

  var clientFunction = ClientFunction(() => {
    window.$trezor = { 
      DeviceList: function(configUrl) {
        return {
          removeListener: function (name, callback) { },
          on: function (name, callback) { },
          hasDeviceOrUnacquiredDevice: function () {
            return true
          },
          acquireFirstDevice: function (bool) {
            new Promise((resolve, reject) => {
              resolve({ device: {  }, session: {  } })
              return new Promise(function (resolve, reject) {});
            }).catch(function () {  })
          }
        }
      }
    }
  })

  await clientFunction()
}
