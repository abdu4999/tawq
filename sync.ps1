# Git Sync Script
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Starting GitHub Sync..." -ForegroundColor Cyan
Set-Location $PSScriptRoot

# Sync workspace folder (part of main repo, not submodule)
Write-Host "`nChecking workspace files..." -ForegroundColor Yellow

# Fetch updates from GitHub
Write-Host "Fetching from GitHub..." -ForegroundColor Yellow
git fetch origin main 2>&1 | Out-Null

# Check if there are remote changes
$LOCAL = git rev-parse HEAD
$REMOTE = git rev-parse origin/main
$BASE = git merge-base HEAD origin/main

if ($LOCAL -ne $REMOTE) {
    if ($LOCAL -eq $BASE) {
        Write-Host "`nRemote changes detected! Pulling updates..." -ForegroundColor Magenta
        git pull origin main --rebase 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Successfully pulled remote changes!" -ForegroundColor Green
        } else {
            Write-Host "Failed to pull remote changes! Please resolve manually." -ForegroundColor Red
            exit 1
        }
    } elseif ($REMOTE -eq $BASE) {
        Write-Host "`nLocal changes detected (remote is behind)" -ForegroundColor Yellow
    } else {
        Write-Host "`nBoth local and remote have changes!" -ForegroundColor Yellow
        Write-Host "Attempting to merge..." -ForegroundColor Yellow
        git pull origin main --rebase 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "`nConflict detected! Please resolve manually" -ForegroundColor Red
            exit 1
        }
    }
}

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
    
    # Push changes
    Write-Host "`nPushing to GitHub..." -ForegroundColor Yellow
    git push origin main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nSync completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "`nPush failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`nNo local changes to sync. Everything up to date!" -ForegroundColor Green
}

Write-Host "`nRecent commits:" -ForegroundColor Cyan
git log --oneline -5
