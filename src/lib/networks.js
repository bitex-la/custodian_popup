import coininfo from 'coininfo'

module.exports = {
  bitcoin: coininfo.bitcoin.main.toBitcoinJS(),
  testnet: coininfo.bitcoin.test.toBitcoinJS(),
  litecoin: coininfo.litecoin.main.toBitcoinJS(),
  bitcoin_cash: {
    hashGenesisBlock: '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
    port: 8333,
    portRpc: 8332,
    protocol: {
      magic: 0xd9b4bef9 // careful, sent over wire as little endian
    },
    seedsDns: [
      'seed.bitcoinabc.org',
      'seed-abc.bitcoinforks.org',
      'btccash-seeder.bitcoinunlimited.info',
      'seed.bitprim.org',
      'seed.deadalnix.me',
      'seeder.criptolayer.net'
    ],
    bip32: {
      private: 0x0488ade4,
      public: 0x0488b21e
    },
    name: 'Bitcoin Cash',
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    testnet: false,
    unit: 'BCH',
    wif: 0x80,
    versions: {
      bip32: {
        private: 0x0488ade4,
        public: 0x0488b21e
      },
      bip44: 145,
      private: 0x80,
      public: 0x00,
      scripthash: 0x05
    }
  },
  bitcoin_cash_testnet: {
    hashGenesisBlock: '000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943',
    port: 18333,
    portRpc: 18332,
    protocol: {
      magic: 0x0709110b
    },
    seedsDns: [
      'testnet-seed.bitcoinabc.org',
      'testnet-seed-abc.bitcoinforks.org',
      'testnet-seed.bitprim.org',
      'testnet-seed.deadalnix.me',
      'testnet-seeder.criptolayer.net'
    ],
    bip32: {
      private: 0x04358394,
      public: 0x043587cf
    },
    name: 'Bitcoin Cash',
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    testnet: true,
    unit: 'BCH',
    wif: 0xef,
    versions: {
      bip32: {
        private: 0x04358394,
        public: 0x043587cf
      },
      bip44: 1,
      private: 0xef,
      public: 0x6f,
      scripthash: 0xc4
    }
  }
}
