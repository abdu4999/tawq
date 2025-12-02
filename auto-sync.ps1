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
        
        # Fetch remote changes first
        Write-Host "[0/4] Checking for remote changes..." -ForegroundColor Yellow
        & $gitPath fetch origin main 2>&1 | Out-Null
        
        # Check if there are remote changes
        $LOCAL = & $gitPath rev-parse HEAD
        $REMOTE = & $gitPath rev-parse origin/main
        $BASE = & $gitPath merge-base HEAD origin/main
        
        $remoteChanges = $false
        if ($LOCAL -ne $REMOTE) {
            if ($LOCAL -eq $BASE) {
                Write-Host "[!] Remote changes detected! Pulling updates..." -ForegroundColor Magenta
                $pullOutput = & $gitPath pull origin main --rebase 2>&1
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[OK] Successfully pulled remote changes!" -ForegroundColor Green
                    $remoteChanges = $true
                } else {
                    Write-Host "[Error] Failed to pull remote changes!" -ForegroundColor Red
                    Write-Host $pullOutput
                    return
                }
            } elseif ($REMOTE -ne $BASE) {
                Write-Host "[!] Both local and remote have changes! Attempting merge..." -ForegroundColor Yellow
                $pullOutput = & $gitPath pull origin main --rebase 2>&1
                
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "[Error] Conflict detected! Please resolve manually." -ForegroundColor Red
                    Write-Host $pullOutput
                    return
                }
                $remoteChanges = $true
            }
        }
        
        # Check for local changes
        $status = & $gitPath status --short 2>&1
        
        if ($status -and $status -notlike "*fatal*" -and $status -notlike "*error*") {
            Write-Host "[1/4] Found local changes:" -ForegroundColor Yellow
            Write-Host $status
            
            Write-Host ""
            Write-Host "[2/4] Adding changes..." -ForegroundColor Yellow
            & $gitPath add -u 2>&1 | Out-Null
            & $gitPath add . 2>&1 | Out-Null
            
            Write-Host "[3/4] Committing changes..." -ForegroundColor Yellow
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            $commitOutput = & $gitPath commit -m "Auto sync: $timestamp" 2>&1
            
            Write-Host "[4/4] Pushing to GitHub..." -ForegroundColor Yellow
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
        } elseif ($remoteChanges) {
            Write-Host "[i] Pulled remote changes, no local changes to push" -ForegroundColor Green
            Write-Host "======================================" -ForegroundColor Cyan
        } else {
            Write-Host "[i] No changes detected" -ForegroundColor Gray
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
    if ($path -like "*\node_modules\*") { return }
    if ($path -like "*\dist\*" -or $path -like "*\build\*") { return }
    if ($path -like "*\.vite\*" -or $path -like "*\.turbo\*") { return }
    if ($name -like "*.tmp" -or $name -like "*.swp" -or $name -like "*~") { return }
    if ($name -like "*.log") { return }
    
    $changeType = $e.ChangeType
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    # عرض المسار النسبي
    $relativePath = $path.Replace($PSScriptRoot, "").TrimStart("\")
    Write-Host "[$timestamp] $changeType : $relativePath" -ForegroundColor Cyan
    
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
