# Auto Sync - يراقب التغييرات ويزامن تلقائياً
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Tawq Auto Sync Watcher" -ForegroundColor Cyan
Write-Host "   مراقبة التغييرات والمزامنة التلقائية" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[*] Starting file watcher..." -ForegroundColor Yellow
Write-Host "[*] سيتم المزامنة تلقائياً عند أي تغيير" -ForegroundColor Yellow
Write-Host "[*] اضغط Ctrl+C للإيقاف" -ForegroundColor Yellow
Write-Host ""

$watchPath = $PSScriptRoot
$lastSync = Get-Date
$syncInterval = 30 # ثواني قبل المزامنة بعد آخر تغيير

# إنشاء FileSystemWatcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $watchPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# تجاهل بعض المجلدات
$watcher.NotifyFilter = [System.IO.NotifyFilters]::FileName -bor 
                        [System.IO.NotifyFilters]::DirectoryName -bor
                        [System.IO.NotifyFilters]::LastWrite

$pendingSync = $false

# دالة المزامنة
function Invoke-GitSync {
    Write-Host ""
    Write-Host "[Sync] بدء المزامنة..." -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Cyan
    
    try {
        # فحص الحالة
        $status = git status --short
        if ($status) {
            Write-Host "[1/3] وجدت تغييرات:" -ForegroundColor Yellow
            Write-Host $status
            
            # إضافة وحفظ
            Write-Host ""
            Write-Host "[2/3] حفظ التغييرات..." -ForegroundColor Yellow
            git add -A
            
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            git commit -m "Auto sync: $timestamp" 2>&1 | Out-Null
            
            # رفع
            Write-Host "[3/3] رفع إلى GitHub..." -ForegroundColor Yellow
            $pushResult = git push origin copilot/develop-performance-tracking-app 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✓ تمت المزامنة بنجاح!" -ForegroundColor Green
                Write-Host "======================================" -ForegroundColor Cyan
            } else {
                Write-Host ""
                Write-Host "✗ فشلت المزامنة!" -ForegroundColor Red
                Write-Host $pushResult
            }
        } else {
            Write-Host "[i] لا توجد تغييرات جديدة" -ForegroundColor Gray
        }
    } catch {
        Write-Host "✗ خطأ: $_" -ForegroundColor Red
    }
    
    $script:lastSync = Get-Date
    $script:pendingSync = $false
    Write-Host ""
    Write-Host "[*] جاهز لرصد التغييرات..." -ForegroundColor Yellow
}

# معالج التغييرات
$onChange = {
    param($sender, $e)
    
    $path = $e.FullPath
    $name = $e.Name
    
    # تجاهل ملفات .git
    if ($path -like "*\.git\*") { return }
    
    # تجاهل ملفات مؤقتة
    if ($name -like "*.tmp" -or $name -like "*.swp" -or $name -like "*~") { return }
    
    $changeType = $e.ChangeType
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    Write-Host "[$timestamp] $changeType : $name" -ForegroundColor Cyan
    
    $script:pendingSync = $true
    $script:lastChange = Get-Date
}

# تسجيل المعالجات
Register-ObjectEvent -InputObject $watcher -EventName Changed -Action $onChange | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Created -Action $onChange | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Deleted -Action $onChange | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Renamed -Action $onChange | Out-Null

Write-Host "[✓] المراقبة نشطة!" -ForegroundColor Green
Write-Host ""

# حلقة المراقبة
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # إذا كان هناك تغييرات معلقة
        if ($pendingSync) {
            $timeSinceChange = (Get-Date) - $lastChange
            
            # انتظر 30 ثانية بعد آخر تغيير قبل المزامنة
            if ($timeSinceChange.TotalSeconds -ge $syncInterval) {
                Invoke-GitSync
            }
        }
    }
} finally {
    # تنظيف
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Get-EventSubscriber | Unregister-Event
    Write-Host ""
    Write-Host "[*] تم إيقاف المراقبة" -ForegroundColor Yellow
}
