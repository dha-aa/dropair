#!/usr/bin/env bash

set -euo pipefail

# ============================================================
# Configuration
# ============================================================

REPO_URL="git@github.com:dha-aa/dropair.git"
DEFAULT_INSTALL_DIR="$HOME/.dropair"
INSTALL_DIR="$DEFAULT_INSTALL_DIR"

# ============================================================
# Colors
# ============================================================

if [[ -t 1 ]]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  RESET='\033[0m'
else
  RED=''
  GREEN=''
  YELLOW=''
  BLUE=''
  RESET=''
fi

# ============================================================
# Helpers
# ============================================================

info() {
  echo -e "${BLUE}==>${RESET} $*"
}

success() {
  echo -e "${GREEN}✓${RESET} $*"
}

warning() {
  echo -e "${YELLOW}!${RESET} $*"
}

error() {
  echo -e "${RED}✗${RESET} $*" >&2
}

die() {
  error "$*"
  exit 1
}

usage() {
  cat <<EOF

Usage:
  $0 [OPTIONS]

Options:
  --dir DIR       Installation directory
  -h, --help      Show this help message

Examples:
  $0
  $0 --dir ~/.dropair
  $0 --dir ~/tools/dropair

Default installation directory:
  $DEFAULT_INSTALL_DIR

EOF
}

# ============================================================
# Dependency checks
# ============================================================

check_dependencies() {
  local dependencies=("git" "npm")

  for command in "${dependencies[@]}"; do
    if ! command -v "$command" >/dev/null 2>&1; then
      die "'$command' is required but was not found. Please install it first."
    fi
  done
}

# ============================================================
# Argument parsing
# ============================================================

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in

      --dir)
        if [[ $# -lt 2 ]]; then
          die "--dir requires an installation directory."
        fi

        INSTALL_DIR="$2"
        shift 2
        ;;

      -h|--help)
        usage
        exit 0
        ;;

      *)
        die "Unknown option: $1. Use --help for usage information."
        ;;

    esac
  done
}

# ============================================================
# Repository handling
# ============================================================

clone_repository() {
  info "Cloning DropAir..."
  echo "Repository: $REPO_URL"
  echo "Directory:  $INSTALL_DIR"
  echo

  git clone "$REPO_URL" "$INSTALL_DIR"

  success "Repository cloned."
}

update_repository() {
  info "Repository already exists at:"
  echo "  $INSTALL_DIR"
  echo

  read -r -p "Update it? [Y/n]: " update_repo < /dev/tty
  update_repo="${update_repo:-Y}"

  if [[ "$update_repo" =~ ^[Yy]$ ]]; then
    info "Updating repository..."

    cd "$INSTALL_DIR"

    local branch
    branch="$(git branch --show-current)"

    if [[ -z "$branch" ]]; then
      die "Could not determine the current Git branch."
    fi

    git pull origin "$branch"

    success "Repository updated."
  else
    warning "Skipping repository update."
  fi
}

prepare_repository() {
  if [[ -e "$INSTALL_DIR" && ! -d "$INSTALL_DIR/.git" ]]; then
    die "Installation directory already exists but is not a Git repository:

  $INSTALL_DIR

Choose another directory with:
  $0 --dir PATH"
  fi

  if [[ -d "$INSTALL_DIR/.git" ]]; then
    update_repository
  else
    clone_repository
  fi
}

# ============================================================
# npm linking
# ============================================================

link_package() {
  info "Linking DropAir with npm..."

  cd "$INSTALL_DIR"

  npm link

  success "DropAir linked successfully."
}

# ============================================================
# Main
# ============================================================

main() {
  parse_args "$@"

  check_dependencies

  echo
  info "Installing DropAir"
  echo "Installation directory: $INSTALL_DIR"
  echo

  prepare_repository

  echo
  link_package

  echo
  success "DropAir installation complete!"
  echo
  echo "Installed at:"
  echo "  $INSTALL_DIR"
  echo
}

main "$@"