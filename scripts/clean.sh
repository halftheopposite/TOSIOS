#!/bin/bash

find . -name "node_modules" -type d -prune -exec rm -rf '{}' +;
find . -name "build" -type d -prune -exec rm -rf '{}' +;