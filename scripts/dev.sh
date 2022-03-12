#!/bin/bash

yarn workspace @tosios/common build;
yarn concurrently --kill-others-on-fail \
    "yarn workspace @tosios/common start" \
    "yarn workspace @tosios/client start" \
    "yarn workspace @tosios/server start" \