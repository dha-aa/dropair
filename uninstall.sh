#!/bin/bash

set -e

echo "Uninstalling DropAir..."

npm unlink -g dropair 2>/dev/null || true

rm -rf "$HOME/.dropair"

rm -f "/usr/local/bin/dropair"

echo "DropAir has been uninstalled.."