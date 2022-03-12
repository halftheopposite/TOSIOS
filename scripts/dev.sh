#!/bin/bash

yarn concurrently --kill-others-on-fail \
    "yarn build" \
    "yarn nodemon ./packages/server/dist/index.js" \