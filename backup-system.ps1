# ======================================================
# 🔒 نظام النسخ الاحتياطي الشامل - Comprehensive Backup System
# ======================================================
# يقوم بإنشاء نسخ احتياطية تلقائية للمشروع بالكامل
# ======================================================

param(
    [string]$BackupType = "full",  # full, incremental, differential
    [string]$Destination = "D:\joker\backups",
    [switch]$Compress = $true,
    [switch]$IncludeNodeModules = $false,
    [switch]$AutoClean = $true,
    [int]$KeepDays = 30
)

# الألوان
$ColorSuccess = "Green"
$ColorWarning = "Yellow"
$ColorError = "Red"
$ColorInfo = "Cyan"

# المسارات
$ProjectRoot = "D:\joker\workspace\shadcn-ui"
$BackupRoot = $Destination
$LogFile = Join-Path $BackupRoot "backup-log.txt"

# إنشاء مجلد النسخ الاحتياطية
if (-not (Test-Path $BackupRoot)) {
    New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
    Write-Host "✅ تم إنشاء مجلد النسخ الاحتياطية: $BackupRoot" -ForegroundColor $ColorSuccess
}

# دالة الطباعة مع التسجيل
function Write-Log {
    param($Message, $Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor $Color
    Add-Content -Path $LogFile -Value $logMessage
}

# بداية النسخ الاحتياطي
Write-Log "=====================================================" $ColorInfo
Write-Log "🔄 بدء عملية النسخ الاحتياطي" $ColorInfo
Write-Log "=====================================================" $ColorInfo
Write-Log "النوع: $BackupType" $ColorInfo
Write-Log "المصدر: $ProjectRoot" $ColorInfo
Write-Log "الوجهة: $BackupRoot" $ColorInfo
Write-Log ""

# اسم النسخة الاحتياطية
$BackupName = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$BackupPath = Join-Path $BackupRoot $BackupName

# إنشاء مجلد النسخة
New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
Write-Log "📁 تم إنشاء مجلد النسخة: $BackupName" $ColorSuccess

# الملفات والمجلدات المستثناة
$ExcludeFolders = @(
    "node_modules",
    ".git",
    "dist",
    "build",
    ".vscode",
    ".idea",
    "coverage",
    ".cache",
    "temp",
    "tmp"
)

if (-not $IncludeNodeModules) {
    Write-Log "⚠️  node_modules سيتم استثناؤه من النسخة" $ColorWarning
}

# دالة النسخ مع الاستثناءات
function Copy-WithExclusions {
    param(
        [string]$Source,
        [string]$Destination
    )
    
    $items = Get-ChildItem -Path $Source -Force
    
    foreach ($item in $items) {
        $shouldExclude = $false
        
        # التحقق من المجلدات المستثناة
        if ($item.PSIsContainer) {
            foreach ($excludeFolder in $ExcludeFolders) {
                if ($item.Name -eq $excludeFolder) {
                    $shouldExclude = $true
                    Write-Log "  ⏭️  تخطي: $($item.Name)" $ColorWarning
                    break
                }
            }
        }
        
        if (-not $shouldExclude) {
            $destPath = Join-Path $Destination $item.Name
            
            if ($item.PSIsContainer) {
                # نسخ المجلد
                if (-not (Test-Path $destPath)) {
                    New-Item -ItemType Directory -Path $destPath -Force | Out-Null
                }
                Copy-WithExclusions -Source $item.FullName -Destination $destPath
            } else {
                # نسخ الملف
                Copy-Item -Path $item.FullName -Destination $destPath -Force
                Write-Host "  ✓ $($item.Name)" -ForegroundColor Gray
            }
        }
    }
}

# بدء عملية النسخ
Write-Log ""
Write-Log "📦 جاري نسخ الملفات..." $ColorInfo
Write-Log ""

try {
    Copy-WithExclusions -Source $ProjectRoot -Destination $BackupPath
    
    # نسخ ملفات الجذر
    Write-Log ""
    Write-Log "📄 نسخ ملفات الجذر..." $ColorInfo
    $rootFiles = @(
        "auto-sync.bat",
        "auto-sync.ps1",
        "RUN-APP.bat",
        "RUN-APP.ps1",
        "sync.bat",
        "sync.ps1"
    )
    
    foreach ($file in $rootFiles) {
        $sourcePath = Join-Path "D:\joker" $file
        if (Test-Path $sourcePath) {
            Copy-Item -Path $sourcePath -Destination $BackupPath -Force
            Write-Log "  ✓ $file" $ColorSuccess
        }
    }
    
    Write-Log ""
    Write-Log "✅ تم نسخ جميع الملفات بنجاح!" $ColorSuccess
    
} catch {
    Write-Log "❌ خطأ أثناء النسخ: $($_.Exception.Message)" $ColorError
    exit 1
}

# إنشاء معلومات النسخة
$backupInfo = @{
    BackupName = $BackupName
    BackupType = $BackupType
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    ProjectPath = $ProjectRoot
    BackupPath = $BackupPath
    IncludedNodeModules = $IncludeNodeModules
    ComputerName = $env:COMPUTERNAME
    UserName = $env:USERNAME
}

$backupInfo | ConvertTo-Json | Out-File (Join-Path $BackupPath "backup-info.json") -Encoding UTF8
Write-Log "📋 تم إنشاء ملف معلومات النسخة" $ColorSuccess

# حساب حجم النسخة
Write-Log ""
Write-Log "📊 حساب حجم النسخة..." $ColorInfo
$backupSize = (Get-ChildItem -Path $BackupPath -Recurse -File | Measure-Object -Property Length -Sum).Sum
$backupSizeMB = [math]::Round($backupSize / 1MB, 2)
$backupSizeGB = [math]::Round($backupSize / 1GB, 2)

if ($backupSizeGB -ge 1) {
    Write-Log "📦 حجم النسخة: $backupSizeGB GB" $ColorSuccess
} else {
    Write-Log "📦 حجم النسخة: $backupSizeMB MB" $ColorSuccess
}

# ضغط النسخة (اختياري)
if ($Compress) {
    Write-Log ""
    Write-Log "🗜️  جاري ضغط النسخة..." $ColorInfo
    
    $zipPath = "$BackupPath.zip"
    
    try {
        Compress-Archive -Path $BackupPath -DestinationPath $zipPath -CompressionLevel Optimal -Force
        Write-Log "✅ تم ضغط النسخة بنجاح!" $ColorSuccess
        
        $zipSize = (Get-Item $zipPath).Length
        $zipSizeMB = [math]::Round($zipSize / 1MB, 2)
        $zipSizeGB = [math]::Round($zipSize / 1GB, 2)
        
        if ($zipSizeGB -ge 1) {
            Write-Log "📦 حجم الملف المضغوط: $zipSizeGB GB" $ColorSuccess
        } else {
            Write-Log "📦 حجم الملف المضغوط: $zipSizeMB MB" $ColorSuccess
        }
        
        $compressionRatio = [math]::Round((1 - ($zipSize / $backupSize)) * 100, 2)
        Write-Log "📉 نسبة الضغط: $compressionRatio%" $ColorSuccess
        
        # حذف المجلد غير المضغوط
        Remove-Item -Path $BackupPath -Recurse -Force
        Write-Log "🗑️  تم حذف المجلد غير المضغوط" $ColorInfo
        
    } catch {
        Write-Log "⚠️  فشل الضغط: $($_.Exception.Message)" $ColorWarning
    }
}

# تنظيف النسخ القديمة (اختياري)
if ($AutoClean) {
    Write-Log ""
    Write-Log "🧹 تنظيف النسخ القديمة..." $ColorInfo
    
    $cutoffDate = (Get-Date).AddDays(-$KeepDays)
    $oldBackups = Get-ChildItem -Path $BackupRoot | Where-Object { 
        $_.Name -like "backup_*" -and $_.CreationTime -lt $cutoffDate 
    }
    
    if ($oldBackups) {
        Write-Log "🗑️  العثور على $($oldBackups.Count) نسخة قديمة..." $ColorWarning
        
        foreach ($oldBackup in $oldBackups) {
            try {
                Remove-Item -Path $oldBackup.FullName -Recurse -Force
                Write-Log "  ✓ حذف: $($oldBackup.Name)" $ColorSuccess
            } catch {
                Write-Log "  ❌ فشل حذف: $($oldBackup.Name)" $ColorError
            }
        }
    } else {
        Write-Log "✅ لا توجد نسخ قديمة للحذف" $ColorSuccess
    }
}

# إحصائيات النسخ الاحتياطية
Write-Log ""
Write-Log "=====================================================" $ColorInfo
Write-Log "📊 إحصائيات النسخ الاحتياطية" $ColorInfo
Write-Log "=====================================================" $ColorInfo

$allBackups = Get-ChildItem -Path $BackupRoot | Where-Object { $_.Name -like "backup_*" }
$totalBackups = $allBackups.Count
$totalSize = ($allBackups | Get-ChildItem -Recurse -File | Measure-Object -Property Length -Sum).Sum
$totalSizeGB = [math]::Round($totalSize / 1GB, 2)

Write-Log "📁 عدد النسخ الاحتياطية: $totalBackups" $ColorInfo
Write-Log "💾 المساحة الكلية: $totalSizeGB GB" $ColorInfo

# النهاية
Write-Log ""
Write-Log "=====================================================" $ColorSuccess
Write-Log "✅ اكتملت عملية النسخ الاحتياطي بنجاح!" $ColorSuccess
Write-Log "=====================================================" $ColorSuccess
Write-Log "📁 موقع النسخة: $BackupRoot" $ColorInfo
Write-Log "⏰ الوقت: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" $ColorInfo
Write-Log ""

# فتح مجلد النسخ الاحتياطية
$openFolder = Read-Host "هل تريد فتح مجلد النسخ الاحتياطية؟ (Y/N)"
if ($openFolder -eq "Y" -or $openFolder -eq "y") {
    Start-Process explorer.exe $BackupRoot
}
