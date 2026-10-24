import "server-only";
import { apiRoutes, routes } from "@/helper/route";

// The scripts the Terminal install commands run (app/api/install/*). They hold no secrets: the
// one-time token comes from the command itself, and the script trades it for a download link at
// /api/install/link. Files that curl and PowerShell download aren't marked as coming from the
// internet, so neither Gatekeeper nor SmartScreen stops the app the first time it opens.
//
// String.raw keeps backslashes as written; the only ${…} in each are the site address and paths. Keep ${ and
// backticks out of the script bodies (bash uses $name, PowerShell avoids its backtick escapes).

/** The command a Mac user pastes into Terminal. */
export const macInstallCommand = (siteUrl: string, token: string) =>
  `curl -fsSL ${siteUrl}${apiRoutes.installMac} | bash -s -- ${token}`;

/** The command a Windows user pastes into PowerShell. */
export const windowsInstallCommand = (siteUrl: string, token: string) =>
  `$env:IOVERLAY_TOKEN='${token}'; irm ${siteUrl}${apiRoutes.installWindows} | iex`;

/**
 * Bash for macOS: picks the installer for this Mac's chip, downloads the .dmg, copies iOverlay.app
 * into Applications (replacing an older copy, quitting it first) and opens it. Everything runs
 * inside main, called on the last line, so a half-downloaded script runs nothing.
 */
export const macInstallScript = (siteUrl: string) => String.raw`#!/bin/bash
# iOverlay installer for macOS. Get your install command from ${siteUrl}${routes.welcome}
set -euo pipefail

SITE="${siteUrl}"
APP="iOverlay"

say()  { printf '\033[1m==>\033[0m %s\n' "$1"; }
fail() { printf '\033[31mError:\033[0m %s\n' "$1" >&2; exit 1; }

main() {
  [ "$#" -gt 0 ] && [ -n "$1" ] || fail "No install code. Copy the full command from $SITE${routes.welcome}"
  local token="$1"
  [ "$(uname -s)" = "Darwin" ] || fail "This installer is for macOS. On Windows, use the PowerShell command instead."

  # Apple Silicon reports x86_64 when Terminal runs under Rosetta, so ask the kernel too.
  local installer="mac-x64"
  if [ "$(uname -m)" = "arm64" ] || [ "$(sysctl -in sysctl.proc_translated 2>/dev/null)" = "1" ]; then
    installer="mac-arm64"
  fi

  # Not local: the EXIT trap below reads it after main has returned.
  work="$(mktemp -d -t ioverlay)"
  trap 'hdiutil detach "$work/volume" -quiet >/dev/null 2>&1 || true; rm -rf "$work"' EXIT

  say "Checking your install code"
  local status
  status="$(curl -sS -X POST -H "Authorization: Bearer $token" -o "$work/link" -w '%{http_code}' \
    "$SITE${apiRoutes.installLink}?installer=$installer")" || fail "Couldn't reach $SITE. Check your internet connection and try again."
  [ "$status" = "200" ] || fail "$(cat "$work/link")"

  say "Downloading iOverlay"
  curl -fL --progress-bar -o "$work/$APP.dmg" "$(cat "$work/link")" || fail "The download didn't finish. Get a new command from $SITE${routes.welcome} and try again."

  say "Installing"
  hdiutil attach "$work/$APP.dmg" -nobrowse -noautoopen -readonly -mountpoint "$work/volume" -quiet </dev/null \
    || fail "Couldn't open the downloaded disk image."
  [ -d "$work/volume/$APP.app" ] || fail "The disk image doesn't contain $APP.app."

  if pgrep -xq "$APP"; then
    osascript -e "quit app \"$APP\"" >/dev/null 2>&1 || true
    sleep 2
    pkill -x "$APP" >/dev/null 2>&1 || true
  fi

  # /Applications when this account may write there, else the account's own Applications folder.
  local target="/Applications"
  if [ ! -w "$target" ]; then
    target="$HOME/Applications"
    mkdir -p "$target"
  fi
  rm -rf "$target/$APP.app"
  ditto "$work/volume/$APP.app" "$target/$APP.app"
  xattr -dr com.apple.quarantine "$target/$APP.app" 2>/dev/null || true

  say "Opening $APP"
  open "$target/$APP.app"
  printf '\n\033[32mDone.\033[0m %s is in %s. Sign in with the login from your email.\n' "$APP" "$target"
}

main "$@"
`;

/**
 * PowerShell for Windows (5.1 and 7): downloads the setup .exe, installs it silently for this user
 * (no admin prompt) and opens the app. Wrapped in & { } and left with return, never exit: the
 * command runs it with iex, so exit would close the user's PowerShell window.
 */
export const windowsInstallScript = (siteUrl: string) => String.raw`# iOverlay installer for Windows. Get your install command from ${siteUrl}${routes.welcome}
& {
  $ErrorActionPreference = 'Stop'
  # Windows PowerShell 5.1 redraws its progress bar so often that it slows downloads to a crawl.
  $ProgressPreference = 'SilentlyContinue'
  [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

  $site = '${siteUrl}'
  $app = 'iOverlay'
  $token = $env:IOVERLAY_TOKEN
  Remove-Item Env:IOVERLAY_TOKEN -ErrorAction SilentlyContinue

  function Say($text) { Write-Host '==> ' -NoNewline -ForegroundColor Cyan; Write-Host $text }
  function Fail($text) { Write-Host "Error: $text" -ForegroundColor Red }

  if (-not $token) { return Fail "No install code. Copy the full command from $site${routes.welcome}" }
  if (-not [Environment]::Is64BitOperatingSystem) { return Fail "$app needs 64-bit Windows 10 or 11." }

  Say 'Checking your install code'
  try {
    $link = Invoke-RestMethod -Method Post -Uri "$site${apiRoutes.installLink}?installer=windows" -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing
  } catch {
    $message = $_.ErrorDetails.Message
    if (-not $message) { $message = "Couldn't reach $site. Check your internet connection and try again." }
    return Fail $message
  }

  $setup = Join-Path $env:TEMP "$app-setup.exe"
  Say "Downloading $app"
  try {
    Invoke-WebRequest -Uri $link.Trim() -OutFile $setup -UseBasicParsing
  } catch {
    return Fail "The download didn't finish. Get a new command from $site${routes.welcome} and try again."
  }

  Say 'Installing'
  Get-Process -Name $app -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  $process = Start-Process -FilePath $setup -ArgumentList '/S', '/currentuser' -Wait -PassThru
  Remove-Item $setup -Force -ErrorAction SilentlyContinue
  if ($process.ExitCode -ne 0) { return Fail "The installer stopped with code $($process.ExitCode). Try again, or contact support." }

  $exe = Join-Path $env:LOCALAPPDATA "Programs\$app\$app.exe"
  if (Test-Path $exe) {
    Say "Opening $app"
    Start-Process -FilePath $exe
    Write-Host ''
    Write-Host 'Done.' -ForegroundColor Green -NoNewline
    Write-Host " $app is installed. Sign in with the login from your email."
  } else {
    Write-Host 'Done.' -ForegroundColor Green -NoNewline
    Write-Host " $app is installed: open it from the Start menu."
  }
}
`;
