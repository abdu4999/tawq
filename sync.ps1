# Git Sync Script
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Starting GitHub Sync..." -ForegroundColor Cyan
Set-Location $PSScriptRoot

# Sync workspace folder (part of main repo, not submodule)
Write-Host "`nChecking workspace files..." -ForegroundColor Yellow

# Fetch updates
Write-Host "Fetching from GitHub..." -ForegroundColor Yellow
git fetch origin main 2>&1 | Out-Null

# Check for local changes
$status = git status --porcelain
if ($status) {
    Write-Host "`nLocal changes found:" -ForegroundColor Green
    git status --short
    
    Write-Host "`nAdding changes..." -ForegroundColor Yellow
    # Add only tracked files and respect .gitignore
    git add -u
    git add .
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "Committing..." -ForegroundColor Yellow
    git commit -m "Auto sync: $timestamp" 2>&1 | Out-Null
}

# Pull updates
Write-Host "`nPulling updates..." -ForegroundColor Yellow
git pull origin main --rebase 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nConflict detected! Please resolve manually" -ForegroundColor Red
    exit 1
}

# Push changes
if ($status) {
    Write-Host "`nPushing to GitHub..." -ForegroundColor Yellow
    git push origin main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nSync completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "`nPush failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`nNo changes to sync. Everything up to date!" -ForegroundColor Green
}

Write-Host "`nRecent commits:" -ForegroundColor Cyan
git log --oneline -5
