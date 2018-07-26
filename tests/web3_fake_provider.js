import { ClientFunction } from 'testcafe';
import * as Web3 from 'web3';
import Web3Mock from 'web3-mock';
import sinon from 'sinon';

export async function mockWeb3(t) {
  var clientFunction = ClientFunction((Web3, Web3Mock) => {
    sinon.stub(Web3, 'default').yields(Web3Mock)
  });
  await clientFunction(Web3, Web3Mock);
}
