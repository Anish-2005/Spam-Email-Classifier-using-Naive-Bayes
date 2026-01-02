# Build and export Next.js frontend, then copy exported files to backend/static
# Usage: run from repository root in PowerShell
# Requires: Node.js & npm installed

$frontendDir = Join-Path -Path (Get-Location) -ChildPath "frontend"
$staticDest = Join-Path -Path (Get-Location) -ChildPath "backend\static"

Write-Host "Building frontend in: $frontendDir"
Push-Location $frontendDir

# Install deps if needed
if (-not (Test-Path node_modules)) {
  Write-Host "Installing frontend dependencies..."
  npm install
}

Write-Host "Running next build..."
npm run build

Write-Host "Running next export... (produces 'out' directory)"
npm run export

Pop-Location

# Copy exported files to backend/static
if (Test-Path $staticDest) {
  Write-Host "Removing existing static directory: $staticDest"
  Remove-Item -Recurse -Force $staticDest
}

Write-Host "Copying exported frontend to $staticDest"
Copy-Item -Path (Join-Path $frontendDir "out") -Destination $staticDest -Recurse

Write-Host "Frontend exported and copied to backend/static"
