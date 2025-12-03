# Run TAWQ App
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "                    TAWQ App - Quick Start" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "$PSScriptRoot\workspace\shadcn-ui"

# Check if pnpm is installed
try {
    $null = Get-Command pnpm -ErrorAction Stop
    Write-Host "[OK] pnpm installed" -ForegroundColor Green
} catch {
    Write-Host "[!] Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] Failed to install pnpm" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "[+] pnpm installed successfully!" -ForegroundColor Green
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "[1/2] Installing dependencies..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Gray
    
    # Try pnpm first
    try {
        $null = Get-Command pnpm -ErrorAction Stop
        & pnpm install
    } catch {
        # Fallback to npm
        & npm install
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[X] Installation failed!" -ForegroundColor Red
        Write-Host "Try manually: npm install" -ForegroundColor Yellow
        pause
        exit 1
    }
    
    Write-Host "[+] Dependencies installed successfully!" -ForegroundColor Green
} else {
    # Verify vite is installed
    if (-not (Test-Path "node_modules\vite")) {
        Write-Host ""
        Write-Host "[!] Dependencies corrupted. Reinstalling..." -ForegroundColor Yellow
        Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
        & npm install
    }
}

Write-Host ""
Write-Host "[2/2] Starting app..." -ForegroundColor Yellow
Write-Host ""
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "   App available at: http://localhost:5173" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
Write-Host ""

pnpm run dev
