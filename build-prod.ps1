# Usage: .\build-prod.ps1 -RenderUrl "https://dinein-api.onrender.com"
param(
    [Parameter(Mandatory=$true)]
    [string]$RenderUrl
)

Write-Host "Building frontend with API URL: $RenderUrl" -ForegroundColor Cyan

$env:REACT_APP_API_URL = $RenderUrl
$env:NODE_NO_WARNINGS = "1"

Set-Location "$PSScriptRoot\frontend"
npm run build

Write-Host ""
Write-Host "Build complete! Drag the 'frontend\build' folder to Netlify." -ForegroundColor Green
