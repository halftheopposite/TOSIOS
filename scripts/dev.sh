#!/bin/bash

yarn concurrently --kill-others-on-fail \
    "yarn build" \
    "yarn serve" \