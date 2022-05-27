# Ledger Connect demo using web3-onboard

## Test

Until the web3-onboard package is publicly released, test it locally
following the steps below.

1. clone the web3-onboard-ledgerconnect package repository locally

        git clone git@github.com:hlopes-ledger/web3-onboard-ledgerconnect.git

1. build and link web3-onboard-ledgerconnect

        cd web3-onboard-ledgerconnect
        yarn && yarn build && yarn link
        cd ..

1. clone the demo repository localy

        git clone git@github.com:hlopes-ledger/web3-onboard-ledgerconnect-demo.git

1. link and run the demo

        cd web3-onboard-ledgerconnect-demo
        yarn && yarn link @ledgerhq/web3-onboard-ledgerconnect
        yarn start

1. access http://{ip-address}:{port} on your iPhone using Safari and make
  sure to enable the Ledger Connect Safari extension and allow it for that
  URL

