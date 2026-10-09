$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$destinationDirectory = Join-Path $root 'public\models'
$destination = Join-Path $destinationDirectory 'Moon_NASA_LRO_8k_Topo_Small.glb'
$source = 'https://svs.gsfc.nasa.gov/vis/a010000/a014900/a014959/Moon_NASA_LRO_8k_Topo_Small.glb'

New-Item -ItemType Directory -Force -Path $destinationDirectory | Out-Null
Write-Host 'Downloading the official NASA SVS LRO topographic Moon model...'
& curl.exe -L --fail --retry 12 --retry-all-errors --retry-delay 15 --connect-timeout 45 --continue-at - --output $destination $source
if ($LASTEXITCODE -ne 0) { throw "NASA download failed with curl exit code $LASTEXITCODE" }

$file = Get-Item -LiteralPath $destination
if ($file.Length -lt 70000000) { throw "Downloaded file is unexpectedly small: $($file.Length) bytes" }
$hash = Get-FileHash -Algorithm SHA256 -LiteralPath $destination
Write-Host "Saved $($file.FullName)"
Write-Host "Bytes: $($file.Length)"
Write-Host "SHA256: $($hash.Hash)"
