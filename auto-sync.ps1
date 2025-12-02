# Auto Sync - Monitors changes and syncs automatically
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Git path
$gitPath = "C:\Program Files\Git\cmd\git.exe"
if (-not (Test-Path $gitPath)) {
    $gitPath = "git"
}

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Tawq Auto Sync Watcher" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[*] Starting file watcher..." -ForegroundColor Yellow
Write-Host "[*] Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

$watchPath = $PSScriptRoot
$lastSync = Get-Date
$syncInterval = 30
$pendingSync = $false
$lastChange = Get-Date

# Create FileSystemWatcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $watchPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::FileName -bor 
                        [System.IO.NotifyFilters]::DirectoryName -bor
                        [System.IO.NotifyFilters]::LastWrite -bor
                        [System.IO.NotifyFilters]::Size

# Sync function
function Invoke-GitSync {
    Write-Host ""
    Write-Host "[Sync] Starting sync..." -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Cyan
    
    try {
        Set-Location $PSScriptRoot
        $status = & $gitPath status --short 2>&1
        
        if ($status -and $status -notlike "*fatal*" -and $status -notlike "*error*") {
            Write-Host "[1/3] Found changes:" -ForegroundColor Yellow
            Write-Host $status
            
            Write-Host ""
            Write-Host "[2/3] Committing changes..." -ForegroundColor Yellow
            & $gitPath add -A 2>&1 | Out-Null
            
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            $commitOutput = & $gitPath commit -m "Auto sync: $timestamp" 2>&1
            
            Write-Host "[3/3] Pushing to GitHub..." -ForegroundColor Yellow
            $pushOutput = & $gitPath push origin main 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "Success! Synced successfully!" -ForegroundColor Green
                Write-Host "======================================" -ForegroundColor Cyan
            } else {
                Write-Host ""
                Write-Host "Failed to sync!" -ForegroundColor Red
                Write-Host $pushOutput
            }
        } else {
            Write-Host "[i] No new changes" -ForegroundColor Gray
        }
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
    
    $script:lastSync = Get-Date
    $script:pendingSync = $false
    Write-Host ""
    Write-Host "[*] Ready to watch for changes..." -ForegroundColor Yellow
}

# Change handler
$onChange = {
    param($sender, $e)
    
    $path = $e.FullPath
    $name = $e.Name
    
    if ($path -like "*\.git\*") { return }
    if ($name -like "*.tmp" -or $name -like "*.swp" -or $name -like "*~") { return }
    
    $changeType = $e.ChangeType
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    Write-Host "[$timestamp] $changeType : $name" -ForegroundColor Cyan
    
    $script:pendingSync = $true
    $script:lastChange = Get-Date
}

# Register events
Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $onChange | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Created -Action $onChange | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Deleted -Action $onChange | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Renamed -Action $onChange | Out-Null

Write-Host "[OK] Watcher is active!" -ForegroundColor Green
Write-Host ""

# Main loop
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        if ($pendingSync) {
            $timeSinceChange = (Get-Date) - $lastChange
            
            if ($timeSinceChange.TotalSeconds -ge $syncInterval) {
                Invoke-GitSync
            }
        }
    }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Get-EventSubscriber | Unregister-Event
    Write-Host ""
    Write-Host "[*] Watcher stopped" -ForegroundColor Yellow
}
