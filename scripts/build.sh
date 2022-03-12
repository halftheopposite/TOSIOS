#!/bin/bash

yarn workspace @tosios/common build;
yarn workspace @tosios/client build;
yarn workspace @tosios/server build;
cp -R ./packages/client/build ./packages/server/build/public;