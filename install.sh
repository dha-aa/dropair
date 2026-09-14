#!/bin/bash

# DropAir Installation Script
# Clones the repository to ~/.dropair and sets it up with npm install and npm link

set -e

REPO_URL="git@github.com:dha-aa/dropair.git"
INSTALL_DIR="$HOME/.dropair"

echo "Installing DropAir to $INSTALL_DIR..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed. Please install git first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Remove existing installation if it exists
if [ -d "$INSTALL_DIR" ]; then
    echo "Removing existing installation..."
    rm -rf "$INSTALL_DIR"
fi

# Clone the repository
echo "Cloning repository..."
git clone "$REPO_URL" "$INSTALL_DIR"

# Navigate to the installation directory
cd "$INSTALL_DIR"

# Install dependencies
echo "Installing dependencies..."
npm install

# Create npm link
echo "Creating npm link..."
npm link

echo "DropAir installed successfully!"
echo ""
echo "Usage:"
echo "    dropair             Start Dropair"
echo "    dropair --help     Show help"
echo "    dropair --uninstall  Uninstall dropair"
echo "    dropair --update    Update dropair"
