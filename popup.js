'use strict'

var $ = require('jquery')
window.jQuery = window.$ = $
var Popper = require('./lib/popper.min.js')
window.Popper = Popper
var bootstrap = require('./lib/bootstrap.min.js')

import 'whatwg-fetch'
import {Promise} from 'es6-promise'

import * as cell from '@intercellular/cell'
import * as device from './device.js'
import {showInfo, showError, loading, notLoading} from './messages.js'
import {loadDeviceHandler} from './load_device_handler.js'
import {debuggerHandler} from './debugger_handler.js'
import * as helpers from './helpers.js'

window.app = {
  $cell: true,
  $type: 'body',
	class: 'container',
  $components: [
		helpers.tabs({
			"Load Device": loadDeviceHandler('load_device'),
			"Debugger": debuggerHandler('debugger')
		})
  ],
	$init(){
		helpers.show_tab('load_device')
	}
}

cell.God.plan(window);
window.addEventListener('load', function(){ cell.God.create(this) });

const HD_HARDENED = 0x80000000;

function getXpubKey(path){
  // make sure bip32 indices are unsigned
  path = path.map((i) => i >>> 0)
  
  device.run((d) => {
    return d.session
      .getPublicKey(path)
      .then((result) => {
        let {message: {xpub, node}} = result
        console.log("Xpub was", {
          success: true,
          xpubkey: xpub,
          chainCode: node.chain_code,
          publicKey: node.public_key,
          pretty: xpubKeyLabel(path),
          path: path
        })
      })
  })
}

function xpubKeyLabel(path) {
    let hardened = (i) => path[i] & ~HD_HARDENED;
    if (hardened(0) === 44) {
        let coinName = getCoinName(path[1]);
        return `${coinName} account #${hardened(2) + 1}`;
    }
    if (hardened(0) === 48) {
        return `multisig account #${hardened(2) + 1}`;
    }
    if (path[0] === 45342) {
        if (hardened(1) === 44) {
            return `Copay ID of account #${hardened(2) + 1}`;
        }
        if (hardened(1) === 48) {
            return `Copay ID of multisig account #${hardened(2) + 1}`;
        }
    }
    return 'm/' + serializePath(path);
}

function serializePath(path) {
    return path.map((i) => {
        let s = (i & ~HD_HARDENED).toString();
        if (i & HD_HARDENED) {
            return s + "'";
        } else {
            return s;
        }
    }).join('/');
}
