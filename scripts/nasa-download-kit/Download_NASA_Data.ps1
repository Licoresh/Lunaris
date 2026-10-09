$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$root = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
function Test-NasaFile([string]$path,[string]$kind) {
  if (!(Test-Path $path)) { return $false }
  if ((Get-Item $path).Length -lt 4096) { return $false }
  $stream=[System.IO.File]::OpenRead($path)
  try { $b=New-Object byte[] 4; [void]$stream.Read($b,0,4) } finally { $stream.Close() }
  if ($kind -eq 'glb') { return ([Text.Encoding]::ASCII.GetString($b) -eq 'glTF') }
  return (($b[0] -eq 73 -and $b[1] -eq 73 -and ($b[2] -eq 42 -or $b[2] -eq 43)) -or ($b[0] -eq 77 -and $b[1] -eq 77 -and $b[3] -eq 42))
}
$items = @(
  @('data/nasa/terrain','Site23_final_adj_5mpp_surf.tif','https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site23/Site23_final_adj_5mpp_surf.tif','tiff'),
  @('data/nasa/terrain','Site23_final_adj_5mpp_slp.tif','https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site23/Site23_final_adj_5mpp_slp.tif','tiff'),
  @('public/models','moon_small.glb','https://svs.gsfc.nasa.gov/vis/a010000/a014900/a014959/moon_small.glb','glb'),
  @('data/nasa/terrain','Site06_final_adj_5mpp_surf.tif','https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site06/Site06_final_adj_5mpp_surf.tif','tiff'),
  @('data/nasa/terrain','Site06_final_adj_5mpp_slp.tif','https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site06/Site06_final_adj_5mpp_slp.tif','tiff'),
  @('data/nasa/terrain','Site07_final_adj_5mpp_surf.tif','https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site07/Site07_final_adj_5mpp_surf.tif','tiff'),
  @('data/nasa/terrain','Site07_final_adj_5mpp_slp.tif','https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site07/Site07_final_adj_5mpp_slp.tif','tiff'),
  @('data/nasa/terrain','Site11_final_adj_5mpp_surf.tif','https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site11/Site11_final_adj_5mpp_surf.tif','tiff'),
  @('data/nasa/terrain','Site11_final_adj_5mpp_slp.tif','https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site11/Site11_final_adj_5mpp_slp.tif','tiff'),
  @('data/nasa/terrain','Site01_final_adj_5mpp_surf.tif','https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site01/Site01_final_adj_5mpp_surf.tif','tiff'),
  @('data/nasa/terrain','Site01_final_adj_5mpp_slp.tif','https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site01/Site01_final_adj_5mpp_slp.tif','tiff'),
  @('data/nasa/terrain','Site04_final_adj_5mpp_surf.tif','https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site04/Site04_final_adj_5mpp_surf.tif','tiff'),
  @('data/nasa/terrain','Site04_final_adj_5mpp_slp.tif','https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/Site04/Site04_final_adj_5mpp_slp.tif','tiff'),
  @('data/nasa/illumination','AVGVISIB_75S_120M_201608.TIF','https://pgda.gsfc.nasa.gov/data/MoonIllumination/AVGVISIB_75S_120M_201608.TIF','tiff'),
  @('data/nasa/earth-visibility','AVGVISIB_75S_120M_201608_EARTH.TIF','https://pgda.gsfc.nasa.gov/data/MoonIllumination/AVGVISIB_75S_120M_201608_EARTH.TIF','tiff')
)
$report=@()
foreach ($item in $items) {
  $folder=Join-Path $root $item[0]
  New-Item -ItemType Directory -Force -Path $folder | Out-Null
  $dest=Join-Path $folder $item[1]
  if (Test-NasaFile $dest $item[3]) { Write-Host "Already verified: $($item[1])" -ForegroundColor Green; $report += "OK $($item[1])"; continue }
  $temp="$dest.partial"
  Write-Host "Downloading $($item[1])..." -ForegroundColor Cyan
  try {
    Invoke-WebRequest -Uri $item[2] -OutFile $temp -TimeoutSec 900 -MaximumRedirection 5 -UseBasicParsing
    if (!(Test-NasaFile $temp $item[3])) { throw 'Invalid file signature or size' }
    Move-Item -LiteralPath $temp -Destination $dest -Force
    $report += "OK $($item[1])"
    Write-Host "Verified: $($item[1])" -ForegroundColor Green
  } catch {
    $report += "FAILED $($item[1]): $($_.Exception.Message)"
    Write-Warning "Failed: $($item[1]) - $($_.Exception.Message)"
  } finally { if (Test-Path $temp) { Remove-Item $temp -Force } }
}
$report | Set-Content (Join-Path $root 'NASA_DOWNLOAD_REPORT.txt')
Write-Host 'Done. Review NASA_DOWNLOAD_REPORT.txt. Re-run for failed downloads.'
