import { Selector } from 'testcafe'

fixture `Getting Started`
    .page `http://localhost:9966`

test('My first test', async t => {
    await t.expect(Selector('.nav-item:first-child a').innerText).eql('Signing')
})
