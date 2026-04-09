# Nexus CLI installer for Windows
# Usage: irm https://your-site.com/install.ps1 | iex
#
# Environment variables:
#   NEXUS_INSTALL_DIR  — override install directory (default: ~\.local\bin)

$ErrorActionPreference = "Stop"

$ReleasesUrl = if ($env:NEXUS_RELEASES_URL) { $env:NEXUS_RELEASES_URL } else { "__RELEASES_URL_PLACEHOLDER__" }
$InstallDir  = if ($env:NEXUS_INSTALL_DIR)  { $env:NEXUS_INSTALL_DIR }  else { Join-Path $HOME ".local\bin" }
$BinaryName  = "nexus-cli.exe"

function Write-Info  { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Ok    { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Err   { param($msg) Write-Host "Error: $msg" -ForegroundColor Red; exit 1 }

if ($ReleasesUrl -like "*PLACEHOLDER*") {
    Write-Err "This install script was not built correctly (missing releases URL)."
}

# ── Detect Arch ──

function Get-Arch {
    $arch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString().ToLower()
    switch ($arch) {
        "x64"   { return "x86_64" }
        "arm64" { return "arm64" }
        default { Write-Err "Unsupported architecture: $arch" }
    }
}

# ── Fetch release metadata ──

function Get-Release {
    Write-Info "Fetching release info ..."
    try {
        $json = Invoke-RestMethod -Uri $ReleasesUrl -UseBasicParsing
    } catch {
        Write-Err "Failed to fetch release metadata: $_"
    }

    if (-not $json.version -or $json.version -eq "0.0.0") {
        Write-Err "No release available yet."
    }

    return $json
}

function Find-Asset {
    param($release, $arch)

    foreach ($asset in $release.assets) {
        if ($asset.platform -eq "windows" -and $asset.arch -eq $arch -and $asset.available -eq $true) {
            return $asset
        }
    }
    return $null
}

# ── Download & Install ──

function Install-NexusCli {
    $arch = Get-Arch
    $release = Get-Release
    $asset = Find-Asset $release $arch

    if (-not $asset) {
        Write-Err "No binary available for windows/$arch."
    }

    Write-Info "Found Nexus CLI v$($release.version) for windows/$arch"

    $tmpDir = Join-Path ([System.IO.Path]::GetTempPath()) "nexus-cli-install-$([guid]::NewGuid().ToString('N').Substring(0,8))"
    New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

    try {
        $archiveName = [System.IO.Path]::GetFileName($asset.download_url)
        $archivePath = Join-Path $tmpDir $archiveName

        Write-Info "Downloading $archiveName ..."
        # Enforce HTTPS to prevent MITM attacks.
        if ($asset.download_url -notmatch '^https://') {
            Write-Err "Refusing to download over insecure connection: $($asset.download_url)"
        }
        Invoke-WebRequest -Uri $asset.download_url -OutFile $archivePath -UseBasicParsing

        # Verify checksum
        if ($asset.checksum_sha256) {
            Write-Info "Verifying checksum ..."
            $actual = (Get-FileHash -Path $archivePath -Algorithm SHA256).Hash.ToLower()
            if ($actual -ne $asset.checksum_sha256) {
                Write-Err "Checksum mismatch!`n  Expected: $($asset.checksum_sha256)`n  Got:      $actual"
            }
        }

        # Extract
        Write-Info "Extracting ..."
        Expand-Archive -Path $archivePath -DestinationPath $tmpDir -Force

        # Find binary
        $binPath = Get-ChildItem -Path $tmpDir -Recurse -Filter $BinaryName | Select-Object -First 1
        if (-not $binPath) {
            Write-Err "Binary not found in archive."
        }

        # Install
        if (-not (Test-Path $InstallDir)) {
            New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        }
        Copy-Item -Path $binPath.FullName -Destination (Join-Path $InstallDir $BinaryName) -Force

        Write-Ok "Installed Nexus CLI v$($release.version) to $(Join-Path $InstallDir $BinaryName)"

        # Check PATH
        $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($userPath -notlike "*$InstallDir*") {
            Write-Host ""
            Write-Info "Adding $InstallDir to your user PATH ..."
            [Environment]::SetEnvironmentVariable("Path", "$userPath;$InstallDir", "User")
            $env:Path = "$env:Path;$InstallDir"
            Write-Ok "PATH updated. Restart your terminal for changes to take effect."
        }
    } finally {
        Remove-Item -Path $tmpDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# ── Main ──

Write-Info "Nexus CLI Installer"
Write-Host ""
Install-NexusCli
Write-Host ""
Write-Ok "Done! Run 'nexus-cli --version' to verify."
