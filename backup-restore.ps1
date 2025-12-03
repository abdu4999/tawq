# ======================================================
# 🔄 نظام استعادة النسخ الاحتياطية - Backup Restore System
# ======================================================
# يقوم باستعادة النسخ الاحتياطية
# ======================================================

param(
    [string]$BackupSource = "",
    [string]$RestorePath = "D:\joker\workspace\shadcn-ui",
    [switch]$Force = $false
)

# الألوان
$ColorSuccess = "Green"
$ColorWarning = "Yellow"
$ColorError = "Red"
$ColorInfo = "Cyan"

Write-Host "=====================================================" -ForegroundColor $ColorInfo
Write-Host "🔄 نظام استعادة النسخ الاحتياطية" -ForegroundColor $ColorInfo
Write-Host "=====================================================" -ForegroundColor $ColorInfo
Write-Host ""

# البحث عن النسخ الاحتياطية المتاحة
$BackupRoot = "D:\joker\backups"

if (-not (Test-Path $BackupRoot)) {
    Write-Host "❌ لا يوجد مجلد نسخ احتياطية!" -ForegroundColor $ColorError
    Write-Host "المسار المتوقع: $BackupRoot" -ForegroundColor $ColorWarning
    exit 1
}

$availableBackups = Get-ChildItem -Path $BackupRoot | Where-Object { 
    $_.Name -like "backup_*" 
} | Sort-Object CreationTime -Descending

if ($availableBackups.Count -eq 0) {
    Write-Host "❌ لا توجد نسخ احتياطية متاحة!" -ForegroundColor $ColorError
    exit 1
}

Write-Host "📦 النسخ الاحتياطية المتاحة:" -ForegroundColor $ColorInfo
Write-Host ""

for ($i = 0; $i -lt $availableBackups.Count; $i++) {
    $backup = $availableBackups[$i]
    $backupDate = $backup.CreationTime.ToString("yyyy-MM-dd HH:mm:ss")
    
    if ($backup.Extension -eq ".zip") {
        $size = [math]::Round($backup.Length / 1MB, 2)
        Write-Host "[$($i + 1)] $($backup.Name) - $backupDate - $size MB" -ForegroundColor $ColorSuccess
    } else {
        $size = (Get-ChildItem -Path $backup.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum
        $sizeMB = [math]::Round($size / 1MB, 2)
        Write-Host "[$($i + 1)] $($backup.Name) - $backupDate - $sizeMB MB" -ForegroundColor $ColorSuccess
    }
}

Write-Host ""
$selection = Read-Host "اختر رقم النسخة المراد استعادتها (أو 0 للإلغاء)"

if ($selection -eq "0" -or $selection -eq "") {
    Write-Host "❌ تم الإلغاء" -ForegroundColor $ColorWarning
    exit 0
}

$selectedIndex = [int]$selection - 1

if ($selectedIndex -lt 0 -or $selectedIndex -ge $availableBackups.Count) {
    Write-Host "❌ اختيار غير صحيح!" -ForegroundColor $ColorError
    exit 1
}

$selectedBackup = $availableBackups[$selectedIndex]
Write-Host ""
Write-Host "✅ تم اختيار: $($selectedBackup.Name)" -ForegroundColor $ColorSuccess

# تحذير
Write-Host ""
Write-Host "⚠️  تحذير: هذه العملية ستستبدل الملفات الحالية!" -ForegroundColor $ColorWarning
Write-Host "المسار: $RestorePath" -ForegroundColor $ColorWarning

if (-not $Force) {
    $confirm = Read-Host "هل أنت متأكد من الاستعادة؟ اكتب 'YES' للتأكيد"
    
    if ($confirm -ne "YES") {
        Write-Host "❌ تم الإلغاء" -ForegroundColor $ColorWarning
        exit 0
    }
}

Write-Host ""
Write-Host "🔄 جاري الاستعادة..." -ForegroundColor $ColorInfo
Write-Host ""

try {
    # إذا كانت النسخة مضغوطة
    if ($selectedBackup.Extension -eq ".zip") {
        Write-Host "📦 فك ضغط النسخة..." -ForegroundColor $ColorInfo
        
        $tempExtractPath = Join-Path $BackupRoot "temp_extract"
        
        if (Test-Path $tempExtractPath) {
            Remove-Item -Path $tempExtractPath -Recurse -Force
        }
        
        Expand-Archive -Path $selectedBackup.FullName -DestinationPath $tempExtractPath -Force
        
        $extractedFolder = Get-ChildItem -Path $tempExtractPath -Directory | Select-Object -First 1
        $sourceFolder = $extractedFolder.FullName
    } else {
        $sourceFolder = $selectedBackup.FullName
    }
    
    # قراءة معلومات النسخة
    $infoFile = Join-Path $sourceFolder "backup-info.json"
    if (Test-Path $infoFile) {
        $backupInfo = Get-Content $infoFile | ConvertFrom-Json
        Write-Host "📋 معلومات النسخة:" -ForegroundColor $ColorInfo
        Write-Host "  التاريخ: $($backupInfo.Timestamp)" -ForegroundColor Gray
        Write-Host "  النوع: $($backupInfo.BackupType)" -ForegroundColor Gray
        Write-Host ""
    }
    
    # نسخ الملفات
    Write-Host "📁 استعادة الملفات..." -ForegroundColor $ColorInfo
    
    if (-not (Test-Path $RestorePath)) {
        New-Item -ItemType Directory -Path $RestorePath -Force | Out-Null
    }
    
    $items = Get-ChildItem -Path $sourceFolder -Recurse
    $totalItems = $items.Count
    $current = 0
    
    foreach ($item in $items) {
        $current++
        $percent = [math]::Round(($current / $totalItems) * 100)
        
        Write-Progress -Activity "استعادة الملفات" -Status "$percent% مكتمل" -PercentComplete $percent
        
        $relativePath = $item.FullName.Substring($sourceFolder.Length + 1)
        $destPath = Join-Path $RestorePath $relativePath
        
        if ($item.PSIsContainer) {
            if (-not (Test-Path $destPath)) {
                New-Item -ItemType Directory -Path $destPath -Force | Out-Null
            }
        } else {
            $destDir = Split-Path -Parent $destPath
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            Copy-Item -Path $item.FullName -Destination $destPath -Force
        }
    }
    
    Write-Progress -Activity "استعادة الملفات" -Completed
    
    # تنظيف المجلد المؤقت
    if ($selectedBackup.Extension -eq ".zip") {
        Remove-Item -Path $tempExtractPath -Recurse -Force
    }
    
    Write-Host ""
    Write-Host "=====================================================" -ForegroundColor $ColorSuccess
    Write-Host "✅ تمت الاستعادة بنجاح!" -ForegroundColor $ColorSuccess
    Write-Host "=====================================================" -ForegroundColor $ColorSuccess
    Write-Host "📁 موقع الاستعادة: $RestorePath" -ForegroundColor $ColorInfo
    Write-Host "⏰ الوقت: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $ColorInfo
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ خطأ أثناء الاستعادة: $($_.Exception.Message)" -ForegroundColor $ColorError
    exit 1
}
