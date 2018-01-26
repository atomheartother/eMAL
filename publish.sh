#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: ./publish [version_number]"
elif [ $# -ge 1 ]; then
    cd ./ff+chrome/ && zip -r ../zip/${1}.zip *
fi
