#!/usr/bin/env bash

pushd dist && zip -rXq build.zip *.png index.html assets && popd