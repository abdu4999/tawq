# ======================================================
# ⏰ نظام النسخ الاحتياطي التلقائي - Auto Backup System
# ======================================================
# ينفذ نسخ احتياطي تلقائي كل فترة محددة
# ======================================================

param(
    [int]$IntervalHours = 6,  # كل 6 ساعات
    [switch]$RunOnce = $false
)

$ColorSuccess = "Green"
$ColorWarning = "Yellow"
$ColorError = "Red"
$ColorInfo = "Cyan"

Write-Host "=====================================================" -ForegroundColor $ColorInfo
Write-Host "⏰ نظام النسخ الاحتياطي التلقائي" -ForegroundColor $ColorInfo
Write-Host "=====================================================" -ForegroundColor $ColorInfo
Write-Host ""

if ($RunOnce) {
    Write-Host "📅 وضع التشغيل: نسخة واحدة فقط" -ForegroundColor $ColorInfo
} else {
    Write-Host "📅 الفترة الزمنية: كل $IntervalHours ساعة" -ForegroundColor $ColorInfo
}

Write-Host ""

function Invoke-Backup {
    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor $ColorInfo
    Write-Host "🔄 بدء النسخ الاحتياطي التلقائي" -ForegroundColor $ColorInfo
    Write-Host "⏰ $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $ColorInfo
    Write-Host "=====================================================" -ForegroundColor $ColorInfo
    Write-Host ""
    
    # تنفيذ النسخ الاحتياطي
    $backupScript = Join-Path "D:\joker" "backup-system.ps1"
    
    if (Test-Path $backupScript) {
        & $backupScript -Compress -AutoClean
    } else {
        Write-Host "❌ لم يتم العثور على سكريبت النسخ الاحتياطي!" -ForegroundColor $ColorError
    }
    
    Write-Host ""
    Write-Host "✅ اكتمل النسخ الاحتياطي التلقائي" -ForegroundColor $ColorSuccess
}

# تنفيذ النسخ الاحتياطي
if ($RunOnce) {
    Invoke-Backup
} else {
    Write-Host "🚀 بدء خدمة النسخ الاحتياطي التلقائي..." -ForegroundColor $ColorSuccess
    Write-Host "اضغط Ctrl+C للإيقاف" -ForegroundColor $ColorWarning
    Write-Host ""
    
    # النسخة الأولى
    Invoke-Backup
    
    # الحلقة المستمرة
    while ($true) {
        $nextBackup = (Get-Date).AddHours($IntervalHours)
        Write-Host "⏳ النسخة التالية في: $($nextBackup.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor $ColorInfo
        
        Start-Sleep -Seconds ($IntervalHours * 3600)
        
        Invoke-Backup
    }
}
