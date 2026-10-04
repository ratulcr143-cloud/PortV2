# Local dev server for Portfolio V1 (http://localhost:3000)
Set-Location $PSScriptRoot
Write-Host "Starting portfolio at http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop." -ForegroundColor DarkGray
npx --yes serve . -l 3000
