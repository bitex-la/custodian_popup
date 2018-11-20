import { ClientFunction } from 'testcafe'

export async function mockXmlHttpRequest (t) {
  var clientFunction = ClientFunction(() => {
    window.XMLHttpRequest = function () {
      return {
        method: '',
        readystate: 4,
        requestHeaders: {},
        responseText: '{}',
        status: 200,
        statusText: '',
        timeout: 0,
        url: '',
        setRequestHeader: function (name, value) {
          this.requestHeaders[name] = value
        },
        abort: function () {},
        open: function (method, url, async) {
          this.method = method
          this.url = url
        },
        send: function (body) {
          this.responseText = '{"jsonrpc": "2.0", "id": "7", "result": "0x4E20"}'
          this.status = 200
          this.statusText = '200 OK'
        },
        onreadystatechange: function () { },
        ontimeout: function () { }
      }
    }
  })
  await clientFunction()
}
