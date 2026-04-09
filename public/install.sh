#!/usr/bin/env bash
# Nexus CLI installer
# Usage: curl -fsSL https://your-site.com/install.sh | bash
#
# Environment variables:
#   NEXUS_INSTALL_DIR  — override install directory (default: ~/.local/bin)
#   NEXUS_VERSION      — install a specific version (default: latest)

set -euo pipefail

RELEASES_URL="${NEXUS_RELEASES_URL:-https://xsyphon-nexus-dev-media.s3.amazonaws.com/releases/cli.json}"
INSTALL_DIR="${NEXUS_INSTALL_DIR:-$HOME/.local/bin}"
BINARY_NAME="nexus-cli"

# ── Helpers ──

info()  { printf '\033[1;34m%s\033[0m\n' "$*"; }
ok()    { printf '\033[1;32m%s\033[0m\n' "$*"; }
err()   { printf '\033[1;31mError: %s\033[0m\n' "$*" >&2; exit 1; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || err "Required command not found: $1"
}

# ── Detect OS / Arch ──

detect_platform() {
  local os arch

  case "$(uname -s)" in
    Linux*)  os="linux" ;;
    Darwin*) os="darwin" ;;
    MINGW*|MSYS*|CYGWIN*) os="windows" ;;
    *) err "Unsupported OS: $(uname -s)" ;;
  esac

  case "$(uname -m)" in
    x86_64|amd64)  arch="x86_64" ;;
    arm64|aarch64) arch="arm64" ;;
    *) err "Unsupported architecture: $(uname -m)" ;;
  esac

  PLATFORM="${os}"
  ARCH="${arch}"
}

# ── Fetch release metadata ──

fetch_release() {
  need_cmd curl
  need_cmd grep
  need_cmd sed

  info "Fetching release info ..."
  local json
  json=$(curl -fsSL "$RELEASES_URL") || err "Failed to fetch release metadata from $RELEASES_URL"

  VERSION=$(echo "$json" | grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

  if [ -z "$VERSION" ] || [ "$VERSION" = "0.0.0" ]; then
    err "No release available yet."
  fi

  # Find the download URL for our platform/arch
  # Parse the JSON assets array to find matching platform and arch
  DOWNLOAD_URL=$(echo "$json" | tr ',' '\n' | tr '{' '\n' | tr '}' '\n' | \
    awk -v platform="$PLATFORM" -v arch="$ARCH" '
      /\"platform\"/ { p = $0; gsub(/.*\"platform\"[[:space:]]*:[[:space:]]*\"/, "", p); gsub(/\".*/, "", p) }
      /\"arch\"/     { a = $0; gsub(/.*\"arch\"[[:space:]]*:[[:space:]]*\"/, "", a); gsub(/\".*/, "", a) }
      /\"download_url\"/ { u = $0; gsub(/.*\"download_url\"[[:space:]]*:[[:space:]]*\"/, "", u); gsub(/\".*/, "", u) }
      /\"available\"/ {
        av = $0; gsub(/.*\"available\"[[:space:]]*:[[:space:]]*/, "", av); gsub(/[[:space:]].*/, "", av)
        if (p == platform && a == arch && av == "true" && u != "") { print u; exit }
      }
    ')

  CHECKSUM=$(echo "$json" | tr ',' '\n' | tr '{' '\n' | tr '}' '\n' | \
    awk -v platform="$PLATFORM" -v arch="$ARCH" '
      /\"platform\"/ { p = $0; gsub(/.*\"platform\"[[:space:]]*:[[:space:]]*\"/, "", p); gsub(/\".*/, "", p) }
      /\"arch\"/     { a = $0; gsub(/.*\"arch\"[[:space:]]*:[[:space:]]*\"/, "", a); gsub(/\".*/, "", a) }
      /\"checksum_sha256\"/ { c = $0; gsub(/.*\"checksum_sha256\"[[:space:]]*:[[:space:]]*\"/, "", c); gsub(/\".*/, "", c) }
      /\"available\"/ {
        av = $0; gsub(/.*\"available\"[[:space:]]*:[[:space:]]*/, "", av); gsub(/[[:space:]].*/, "", av)
        if (p == platform && a == arch && av == "true" && c != "") { print c; exit }
      }
    ')

  if [ -z "$DOWNLOAD_URL" ]; then
    err "No binary available for ${PLATFORM}/${ARCH}."
  fi

  info "Found Nexus CLI v${VERSION} for ${PLATFORM}/${ARCH}"
}

# ── Download & Install ──

install() {
  local tmpdir
  tmpdir=$(mktemp -d)
  trap 'rm -rf "$tmpdir"' EXIT

  local archive_name
  archive_name=$(basename "$DOWNLOAD_URL")

  info "Downloading ${archive_name} ..."
  # Enforce HTTPS to prevent MITM attacks.
  case "$DOWNLOAD_URL" in
    https://*) ;;
    *) err "Refusing to download over insecure connection: ${DOWNLOAD_URL}" ;;
  esac
  curl -fsSL -o "${tmpdir}/${archive_name}" "$DOWNLOAD_URL" || err "Download failed."

  # Verify checksum if available
  if [ -n "$CHECKSUM" ]; then
    info "Verifying checksum ..."
    local actual
    if command -v sha256sum >/dev/null 2>&1; then
      actual=$(sha256sum "${tmpdir}/${archive_name}" | awk '{print $1}')
    elif command -v shasum >/dev/null 2>&1; then
      actual=$(shasum -a 256 "${tmpdir}/${archive_name}" | awk '{print $1}')
    fi
    if [ -n "$actual" ] && [ "$actual" != "$CHECKSUM" ]; then
      err "Checksum mismatch!\n  Expected: ${CHECKSUM}\n  Got:      ${actual}"
    fi
  fi

  # Extract
  info "Extracting ..."
  case "$archive_name" in
    *.tar.gz|*.tgz)
      tar xzf "${tmpdir}/${archive_name}" -C "$tmpdir"
      ;;
    *.zip)
      need_cmd unzip
      unzip -qo "${tmpdir}/${archive_name}" -d "$tmpdir"
      ;;
    *)
      err "Unknown archive format: ${archive_name}"
      ;;
  esac

  # Find the binary
  local bin_path
  bin_path=$(find "$tmpdir" -name "${BINARY_NAME}" -o -name "${BINARY_NAME}.exe" | head -1)
  if [ -z "$bin_path" ]; then
    err "Binary not found in archive."
  fi

  # Install
  mkdir -p "$INSTALL_DIR"
  cp "$bin_path" "${INSTALL_DIR}/${BINARY_NAME}"
  chmod +x "${INSTALL_DIR}/${BINARY_NAME}"

  ok "Installed Nexus CLI v${VERSION} to ${INSTALL_DIR}/${BINARY_NAME}"

  # Ensure INSTALL_DIR is in PATH — auto-add to shell profile if needed.
  case ":$PATH:" in
    *":${INSTALL_DIR}:"*)
      # Already in PATH, nothing to do.
      ;;
    *)
      local line="export PATH=\"${INSTALL_DIR}:\$PATH\""
      local profile=""

      # Detect the right profile file.
      if [ -n "${ZSH_VERSION:-}" ] || [ "$(basename "${SHELL:-}")" = "zsh" ]; then
        profile="$HOME/.zshrc"
      elif [ -n "${BASH_VERSION:-}" ] || [ "$(basename "${SHELL:-}")" = "bash" ]; then
        # Prefer .bashrc on Linux, .bash_profile on macOS.
        if [ -f "$HOME/.bash_profile" ]; then
          profile="$HOME/.bash_profile"
        else
          profile="$HOME/.bashrc"
        fi
      elif [ -f "$HOME/.profile" ]; then
        profile="$HOME/.profile"
      fi

      if [ -n "$profile" ]; then
        # Only append if not already present.
        if ! grep -qF "$INSTALL_DIR" "$profile" 2>/dev/null; then
          echo "" >> "$profile"
          echo "# Added by Nexus CLI installer" >> "$profile"
          echo "$line" >> "$profile"
          info "Added ${INSTALL_DIR} to PATH in ${profile}"
          info "Restart your terminal or run: source ${profile}"
        fi
        # Also export for the current session.
        export PATH="${INSTALL_DIR}:$PATH"
      else
        echo ""
        info "Could not detect shell profile. Add this to your shell config manually:"
        echo ""
        echo "  $line"
      fi
      ;;
  esac
}

# ── Main ──

main() {
  info "Nexus CLI Installer"
  echo ""
  detect_platform
  fetch_release
  install
  echo ""
  ok "Done! Run 'nexus-cli --version' to verify."
}

main
