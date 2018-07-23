#!/bin/bash

USER=$1
IP=$2

node_modules/webpack-cli/bin/webpack.js --mode=production
trezor-agent $HOME/.ssh/config -- scp src/bootstrap.css src/popup.css $USER@$IP:/home/ubuntu/apps/custodian_popup/src
trezor-agent $HOME/.ssh/config -- scp build/popup.bundle.js build/popup.bundle.js.map index.html $USER@$IP:/home/ubuntu/apps/custodian_popup 
