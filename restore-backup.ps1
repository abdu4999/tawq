# ========================================
# استعادة من نسخة احتياطية
# Restore from Backup
# ========================================

param(
    [string]$BackupPath = "",
    [switch]$ListBackups,
    [switch]$Latest
)

$Colors = @{
    Success = "Green"
    Info = "Cyan"
    Warning = "Yellow"
    Error = "Red"
    Header = "Magenta"
}

function Write-ColorOutput($Message, $Color) {
    Write-Host $Message -ForegroundColor $Color
}

function Show-Header {
    Clear-Host
    Write-ColorOutput "`n╔════════════════════════════════════════════════════╗" $Colors.Header
    Write-ColorOutput "║          🔓 نظام استعادة النسخ الاحتياطية         ║" $Colors.Header
    Write-ColorOutput "║            Backup Restore System                  ║" $Colors.Header
    Write-ColorOutput "╚════════════════════════════════════════════════════╝`n" $Colors.Header
}

function Get-AvailableBackups {
    $BackupRoot = "d:\joker\backups"
    
    $Backups = Get-ChildItem -Path $BackupRoot -Recurse -Filter "backup-manifest.json" | ForEach-Object {
        $Manifest = Get-Content $_.FullName | ConvertFrom-Json
        $Manifest | Add-Member -NotePropertyName ManifestPath -NotePropertyValue $_.FullName -PassThru
    } | Sort-Object Timestamp -Descending
    
    return $Backups
}

function Show-BackupList {
    $Backups = Get-AvailableBackups
    
    if ($Backups.Count -eq 0) {
        Write-ColorOutput "❌ لا توجد نسخ احتياطية متاحة!" $Colors.Error
        return
    }
    
    Write-ColorOutput "📋 النسخ الاحتياطية المتاحة:`n" $Colors.Header
    
    $Index = 1
    foreach ($Backup in $Backups) {
        $ZipFile = "$($Backup.BackupPath).zip"
        $HasZip = Test-Path $ZipFile
        $Status = if ($HasZip) { "✅ مضغوطة" } else { "📁 عادية" }
        
        Write-ColorOutput "[$Index] $Status" $Colors.Info
        Write-ColorOutput "    📅 التاريخ: $($Backup.Timestamp)" $Colors.Info
        Write-ColorOutput "    📁 النوع: $($Backup.Type)" $Colors.Info
        Write-ColorOutput "    📊 الملفات: $($Backup.FileCount)" $Colors.Info
        Write-ColorOutput "    💾 الحجم: $($Backup.TotalSize) MB" $Colors.Info
        Write-ColorOutput "    📌 Branch: $($Backup.GitBranch)" $Colors.Info
        if ($Backup.CustomMessage) {
            Write-ColorOutput "    💬 رسالة: $($Backup.CustomMessage)" $Colors.Info
        }
        Write-ColorOutput "    📂 المسار: $($Backup.BackupPath)" $Colors.Info
        Write-Host ""
        $Index++
    }
}

function Restore-Backup {
    param($BackupPath)
    
    if (-not (Test-Path $BackupPath)) {
        # محاولة فك ضغط الملف
        $ZipPath = "$BackupPath.zip"
        if (Test-Path $ZipPath) {
            Write-ColorOutput "📦 فك ضغط النسخة الاحتياطية..." $Colors.Info
            Expand-Archive -Path $ZipPath -DestinationPath (Split-Path $BackupPath -Parent) -Force
        } else {
            Write-ColorOutput "❌ النسخة الاحتياطية غير موجودة!" $Colors.Error
            return $false
        }
    }
    
    # قراءة Manifest
    $ManifestPath = Join-Path $BackupPath "backup-manifest.json"
    if (-not (Test-Path $ManifestPath)) {
        Write-ColorOutput "❌ ملف Manifest غير موجود!" $Colors.Error
        return $false
    }
    
    $Manifest = Get-Content $ManifestPath | ConvertFrom-Json
    
    Write-ColorOutput "`n📋 معلومات النسخة الاحتياطية:" $Colors.Header
    Write-ColorOutput "  📅 التاريخ: $($Manifest.Timestamp)" $Colors.Info
    Write-ColorOutput "  📁 النوع: $($Manifest.Type)" $Colors.Info
    Write-ColorOutput "  📊 الملفات: $($Manifest.FileCount)" $Colors.Info
    Write-ColorOutput "  💾 الحجم: $($Manifest.TotalSize) MB" $Colors.Info
    
    # تأكيد الاستعادة
    Write-ColorOutput "`n⚠️  تحذير: سيتم استبدال الملفات الحالية!" $Colors.Warning
    $Confirm = Read-Host "هل تريد الاستمرار؟ (نعم/لا)"
    
    if ($Confirm -ne "نعم" -and $Confirm -ne "yes" -and $Confirm -ne "y") {
        Write-ColorOutput "❌ تم إلغاء الاستعادة" $Colors.Error
        return $false
    }
    
    Write-ColorOutput "`n🔄 جاري الاستعادة..." $Colors.Info
    
    $ProjectRoot = "d:\joker\workspace\shadcn-ui"
    
    # نسخ الملفات
    $Files = Get-ChildItem -Path $BackupPath -Recurse -File | Where-Object {
        $_.Name -ne "backup-manifest.json"
    }
    
    $Counter = 0
    $Total = $Files.Count
    
    foreach ($File in $Files) {
        $Counter++
        $RelativePath = $File.FullName.Substring($BackupPath.Length + 1)
        $DestPath = Join-Path $ProjectRoot $RelativePath
        $DestDir = Split-Path $DestPath -Parent
        
        if (-not (Test-Path $DestDir)) {
            New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
        }
        
        Copy-Item -Path $File.FullName -Destination $DestPath -Force
        
        if ($Counter % 50 -eq 0) {
            $Progress = [math]::Round(($Counter / $Total) * 100, 1)
            Write-ColorOutput "  📦 تم استعادة $Counter / $Total ملف ($Progress%)" $Colors.Info
        }
    }
    
    Write-ColorOutput "`n  ✅ تم استعادة جميع الملفات بنجاح!" $Colors.Success
    Write-ColorOutput "  📁 الموقع: $ProjectRoot" $Colors.Info
    
    return $true
}

# الدالة الرئيسية
Show-Header

if ($ListBackups) {
    Show-BackupList
    exit
}

if ($Latest) {
    $Backups = Get-AvailableBackups
    if ($Backups.Count -eq 0) {
        Write-ColorOutput "❌ لا توجد نسخ احتياطية متاحة!" $Colors.Error
        exit
    }
    $BackupPath = $Backups[0].BackupPath
    Write-ColorOutput "📌 تم اختيار أحدث نسخة احتياطية" $Colors.Info
}

if (-not $BackupPath) {
    Write-ColorOutput "❌ يرجى تحديد مسار النسخة الاحتياطية أو استخدام -ListBackups أو -Latest" $Colors.Error
    Write-ColorOutput "`nأمثلة:" $Colors.Info
    Write-ColorOutput "  .\restore-backup.ps1 -ListBackups" $Colors.Info
    Write-ColorOutput "  .\restore-backup.ps1 -Latest" $Colors.Info
    Write-ColorOutput "  .\restore-backup.ps1 -BackupPath 'd:\joker\backups\full\backup_2025-12-03_10-30-45'" $Colors.Info
    exit
}

$Success = Restore-Backup -BackupPath $BackupPath

if ($Success) {
    Write-ColorOutput "`n╔════════════════════════════════════════════════════╗" $Colors.Header
    Write-ColorOutput "║          ✅ تمت الاستعادة بنجاح!                  ║" $Colors.Header
    Write-ColorOutput "╚════════════════════════════════════════════════════╝" $Colors.Header
} else {
    Write-ColorOutput "`n❌ فشلت عملية الاستعادة!" $Colors.Error
}
