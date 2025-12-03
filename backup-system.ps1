# ========================================
# نظام النسخ الاحتياطي الشامل
# Comprehensive Backup System
# ========================================

param(
    [string]$BackupType = "full",  # full, incremental, git-only
    [string]$CustomMessage = ""
)

# الألوان
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
    Write-ColorOutput "║        🔒 نظام النسخ الاحتياطي الشامل 🔒        ║" $Colors.Header
    Write-ColorOutput "║          Comprehensive Backup System              ║" $Colors.Header
    Write-ColorOutput "╚════════════════════════════════════════════════════╝`n" $Colors.Header
}

function Get-Timestamp {
    return Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
}

function Get-DateStamp {
    return Get-Date -Format "yyyy-MM-dd"
}

# المسارات
$ProjectRoot = "d:\joker\workspace\shadcn-ui"
$BackupRoot = "d:\joker\backups"
$Timestamp = Get-Timestamp
$DateStamp = Get-DateStamp

# مجلدات النسخ الاحتياطي
$DailyBackupDir = Join-Path $BackupRoot "daily\$DateStamp"
$FullBackupDir = Join-Path $BackupRoot "full\backup_$Timestamp"
$IncrementalBackupDir = Join-Path $BackupRoot "incremental\$DateStamp"
$GitBackupDir = Join-Path $BackupRoot "git"
$DatabaseBackupDir = Join-Path $BackupRoot "database"
$ConfigBackupDir = Join-Path $BackupRoot "config"

# إنشاء المجلدات
function Initialize-BackupDirectories {
    Write-ColorOutput "📁 إنشاء مجلدات النسخ الاحتياطي..." $Colors.Info
    
    $Directories = @(
        $BackupRoot,
        $DailyBackupDir,
        $FullBackupDir,
        $IncrementalBackupDir,
        $GitBackupDir,
        $DatabaseBackupDir,
        $ConfigBackupDir
    )
    
    foreach ($Dir in $Directories) {
        if (-not (Test-Path $Dir)) {
            New-Item -ItemType Directory -Path $Dir -Force | Out-Null
            Write-ColorOutput "  ✓ تم إنشاء: $Dir" $Colors.Success
        }
    }
}

# نسخ احتياطي كامل
function Backup-Full {
    Write-ColorOutput "`n🔄 بدء النسخ الاحتياطي الكامل..." $Colors.Header
    
    $ExcludeDirs = @(
        "node_modules",
        ".next",
        ".git",
        "dist",
        "build",
        ".cache"
    )
    
    $SourceFiles = Get-ChildItem -Path $ProjectRoot -Recurse -File | Where-Object {
        $Path = $_.FullName
        $Exclude = $false
        foreach ($Dir in $ExcludeDirs) {
            if ($Path -like "*\$Dir\*") {
                $Exclude = $true
                break
            }
        }
        -not $Exclude
    }
    
    $TotalFiles = $SourceFiles.Count
    $Counter = 0
    
    Write-ColorOutput "  📊 إجمالي الملفات: $TotalFiles" $Colors.Info
    
    foreach ($File in $SourceFiles) {
        $Counter++
        $RelativePath = $File.FullName.Substring($ProjectRoot.Length + 1)
        $DestPath = Join-Path $FullBackupDir $RelativePath
        $DestDir = Split-Path $DestPath -Parent
        
        if (-not (Test-Path $DestDir)) {
            New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
        }
        
        Copy-Item -Path $File.FullName -Destination $DestPath -Force
        
        if ($Counter % 50 -eq 0) {
            $Progress = [math]::Round(($Counter / $TotalFiles) * 100, 1)
            Write-ColorOutput "  📦 تم نسخ $Counter / $TotalFiles ملف ($Progress%)" $Colors.Info
        }
    }
    
    Write-ColorOutput "  ✅ تم النسخ الاحتياطي الكامل بنجاح!" $Colors.Success
    Write-ColorOutput "  📁 الموقع: $FullBackupDir" $Colors.Info
}

# نسخ احتياطي تدريجي (الملفات المعدلة اليوم فقط)
function Backup-Incremental {
    Write-ColorOutput "`n🔄 بدء النسخ الاحتياطي التدريجي..." $Colors.Header
    
    $Today = Get-Date
    $ModifiedFiles = Get-ChildItem -Path $ProjectRoot -Recurse -File | Where-Object {
        $_.LastWriteTime.Date -eq $Today.Date -and
        $_.FullName -notlike "*\node_modules\*" -and
        $_.FullName -notlike "*\.git\*" -and
        $_.FullName -notlike "*\dist\*" -and
        $_.FullName -notlike "*\build\*"
    }
    
    $Count = $ModifiedFiles.Count
    Write-ColorOutput "  📊 ملفات معدلة اليوم: $Count" $Colors.Info
    
    if ($Count -eq 0) {
        Write-ColorOutput "  ℹ️  لا توجد ملفات معدلة اليوم" $Colors.Warning
        return
    }
    
    foreach ($File in $ModifiedFiles) {
        $RelativePath = $File.FullName.Substring($ProjectRoot.Length + 1)
        $DestPath = Join-Path $IncrementalBackupDir $RelativePath
        $DestDir = Split-Path $DestPath -Parent
        
        if (-not (Test-Path $DestDir)) {
            New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
        }
        
        Copy-Item -Path $File.FullName -Destination $DestPath -Force
    }
    
    Write-ColorOutput "  ✅ تم النسخ التدريجي بنجاح!" $Colors.Success
    Write-ColorOutput "  📁 الموقع: $IncrementalBackupDir" $Colors.Info
}

# نسخ احتياطي Git
function Backup-Git {
    Write-ColorOutput "`n🔄 نسخ احتياطي Git..." $Colors.Header
    
    Push-Location $ProjectRoot
    
    # حفظ معلومات Git
    $GitInfo = @{
        Branch = git rev-parse --abbrev-ref HEAD
        Commit = git rev-parse HEAD
        Status = git status --porcelain
        RemoteUrl = git remote get-url origin
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    $GitInfoPath = Join-Path $GitBackupDir "git-info_$Timestamp.json"
    $GitInfo | ConvertTo-Json | Out-File $GitInfoPath -Encoding UTF8
    
    Write-ColorOutput "  📌 Branch: $($GitInfo.Branch)" $Colors.Info
    Write-ColorOutput "  📌 Commit: $($GitInfo.Commit.Substring(0, 8))" $Colors.Info
    
    # نسخ ملفات Git المهمة
    $GitFiles = @(
        ".gitignore",
        ".gitattributes"
    )
    
    foreach ($File in $GitFiles) {
        $SourcePath = Join-Path $ProjectRoot $File
        if (Test-Path $SourcePath) {
            $DestPath = Join-Path $GitBackupDir "$File`_$Timestamp"
            Copy-Item -Path $SourcePath -Destination $DestPath -Force
        }
    }
    
    # Bundle repository
    $BundlePath = Join-Path $GitBackupDir "repo-bundle_$Timestamp.bundle"
    git bundle create $BundlePath --all 2>$null
    
    if (Test-Path $BundlePath) {
        $BundleSize = (Get-Item $BundlePath).Length / 1MB
        Write-ColorOutput "  ✅ تم إنشاء Git bundle بنجاح! (${BundleSize:N2} MB)" $Colors.Success
    }
    
    Pop-Location
}

# نسخ احتياطي قواعد البيانات
function Backup-Database {
    Write-ColorOutput "`n🔄 نسخ احتياطي قواعد البيانات..." $Colors.Header
    
    $DbFiles = @(
        "$ProjectRoot\database_system_errors.sql",
        "$ProjectRoot\database_tables.sql"
    )
    
    $Count = 0
    foreach ($DbFile in $DbFiles) {
        if (Test-Path $DbFile) {
            $FileName = Split-Path $DbFile -Leaf
            $DestPath = Join-Path $DatabaseBackupDir "$($FileName -replace '\.sql$', '')_$Timestamp.sql"
            Copy-Item -Path $DbFile -Destination $DestPath -Force
            Write-ColorOutput "  ✓ $FileName" $Colors.Success
            $Count++
        }
    }
    
    if ($Count -gt 0) {
        Write-ColorOutput "  ✅ تم نسخ $Count ملف قاعدة بيانات" $Colors.Success
    } else {
        Write-ColorOutput "  ℹ️  لا توجد ملفات قواعد بيانات" $Colors.Warning
    }
}

# نسخ احتياطي الإعدادات
function Backup-Config {
    Write-ColorOutput "`n🔄 نسخ احتياطي ملفات الإعدادات..." $Colors.Header
    
    $ConfigFiles = @(
        "package.json",
        "package-lock.json",
        "pnpm-lock.yaml",
        "tsconfig.json",
        "tsconfig.app.json",
        "tsconfig.node.json",
        "vite.config.ts",
        "tailwind.config.ts",
        "postcss.config.js",
        "eslint.config.js",
        "components.json",
        "template_config.json"
    )
    
    $Count = 0
    foreach ($ConfigFile in $ConfigFiles) {
        $SourcePath = Join-Path $ProjectRoot $ConfigFile
        if (Test-Path $SourcePath) {
            $DestPath = Join-Path $ConfigBackupDir "$ConfigFile`_$Timestamp"
            Copy-Item -Path $SourcePath -Destination $DestPath -Force
            Write-ColorOutput "  ✓ $ConfigFile" $Colors.Success
            $Count++
        }
    }
    
    Write-ColorOutput "  ✅ تم نسخ $Count ملف إعدادات" $Colors.Success
}

# نسخ المستندات المهمة
function Backup-Documentation {
    Write-ColorOutput "`n🔄 نسخ احتياطي المستندات..." $Colors.Header
    
    $DocsDir = Join-Path $BackupRoot "documentation\$DateStamp"
    if (-not (Test-Path $DocsDir)) {
        New-Item -ItemType Directory -Path $DocsDir -Force | Out-Null
    }
    
    $DocFiles = Get-ChildItem -Path $ProjectRoot -Filter "*.md" -Recurse | Where-Object {
        $_.FullName -notlike "*\node_modules\*" -and
        $_.FullName -notlike "*\.git\*"
    }
    
    $Count = 0
    foreach ($Doc in $DocFiles) {
        $RelativePath = $Doc.FullName.Substring($ProjectRoot.Length + 1)
        $DestPath = Join-Path $DocsDir $RelativePath
        $DestDir = Split-Path $DestPath -Parent
        
        if (-not (Test-Path $DestDir)) {
            New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
        }
        
        Copy-Item -Path $Doc.FullName -Destination $DestPath -Force
        $Count++
    }
    
    Write-ColorOutput "  ✅ تم نسخ $Count ملف مستندات" $Colors.Success
}

# إنشاء ملف معلومات النسخة الاحتياطية
function Create-BackupManifest {
    param($BackupDir, $Type)
    
    $Manifest = @{
        Type = $Type
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        ProjectPath = $ProjectRoot
        BackupPath = $BackupDir
        CustomMessage = $CustomMessage
        FileCount = (Get-ChildItem -Path $BackupDir -Recurse -File).Count
        TotalSize = [math]::Round((Get-ChildItem -Path $BackupDir -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
        GitBranch = (git -C $ProjectRoot rev-parse --abbrev-ref HEAD 2>$null)
        GitCommit = (git -C $ProjectRoot rev-parse HEAD 2>$null)
    }
    
    $ManifestPath = Join-Path $BackupDir "backup-manifest.json"
    $Manifest | ConvertTo-Json -Depth 5 | Out-File $ManifestPath -Encoding UTF8
    
    return $Manifest
}

# تنظيف النسخ القديمة
function Cleanup-OldBackups {
    param([int]$DaysToKeep = 30)
    
    Write-ColorOutput "`n🧹 تنظيف النسخ الاحتياطية القديمة..." $Colors.Header
    
    $CutoffDate = (Get-Date).AddDays(-$DaysToKeep)
    $DeletedCount = 0
    $DeletedSize = 0
    
    $OldBackups = Get-ChildItem -Path $BackupRoot -Recurse -Directory | Where-Object {
        $_.CreationTime -lt $CutoffDate -and
        $_.FullName -match '\d{4}-\d{2}-\d{2}'
    }
    
    foreach ($Backup in $OldBackups) {
        $Size = (Get-ChildItem -Path $Backup.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum
        $DeletedSize += $Size
        Remove-Item -Path $Backup.FullName -Recurse -Force
        $DeletedCount++
    }
    
    if ($DeletedCount -gt 0) {
        $SizeMB = [math]::Round($DeletedSize / 1MB, 2)
        Write-ColorOutput "  ✅ تم حذف $DeletedCount نسخة قديمة ($SizeMB MB)" $Colors.Success
    } else {
        Write-ColorOutput "  ℹ️  لا توجد نسخ قديمة للحذف" $Colors.Info
    }
}

# ضغط النسخة الاحتياطية
function Compress-Backup {
    param($BackupDir)
    
    Write-ColorOutput "`n📦 ضغط النسخة الاحتياطية..." $Colors.Header
    
    $ZipPath = "$BackupDir.zip"
    
    if (Test-Path $ZipPath) {
        Remove-Item $ZipPath -Force
    }
    
    Compress-Archive -Path $BackupDir -DestinationPath $ZipPath -CompressionLevel Optimal
    
    $OriginalSize = [math]::Round((Get-ChildItem -Path $BackupDir -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
    $CompressedSize = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
    $Ratio = [math]::Round((1 - ($CompressedSize / $OriginalSize)) * 100, 1)
    
    Write-ColorOutput "  📊 الحجم الأصلي: $OriginalSize MB" $Colors.Info
    Write-ColorOutput "  📊 الحجم المضغوط: $CompressedSize MB" $Colors.Info
    Write-ColorOutput "  📊 نسبة الضغط: $Ratio%" $Colors.Info
    Write-ColorOutput "  ✅ تم الضغط بنجاح!" $Colors.Success
    
    return $ZipPath
}

# عرض تقرير النسخة الاحتياطية
function Show-BackupReport {
    param($Manifest, $ZipPath)
    
    Write-ColorOutput "`n╔════════════════════════════════════════════════════╗" $Colors.Header
    Write-ColorOutput "║              📊 تقرير النسخة الاحتياطية          ║" $Colors.Header
    Write-ColorOutput "╚════════════════════════════════════════════════════╝" $Colors.Header
    
    Write-ColorOutput "`n  📅 التاريخ: $($Manifest.Timestamp)" $Colors.Info
    Write-ColorOutput "  📁 النوع: $($Manifest.Type)" $Colors.Info
    Write-ColorOutput "  📊 عدد الملفات: $($Manifest.FileCount)" $Colors.Info
    Write-ColorOutput "  💾 الحجم: $($Manifest.TotalSize) MB" $Colors.Info
    Write-ColorOutput "  📌 Branch: $($Manifest.GitBranch)" $Colors.Info
    Write-ColorOutput "  📌 Commit: $($Manifest.GitCommit.Substring(0, 8))" $Colors.Info
    
    if ($ZipPath) {
        $ZipSize = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
        Write-ColorOutput "  📦 ملف مضغوط: $ZipSize MB" $Colors.Info
    }
    
    if ($Manifest.CustomMessage) {
        Write-ColorOutput "  💬 رسالة: $($Manifest.CustomMessage)" $Colors.Info
    }
    
    Write-ColorOutput "`n  ✅ تم الانتهاء بنجاح!" $Colors.Success
    Write-ColorOutput "  📂 الموقع: $($Manifest.BackupPath)" $Colors.Info
}

# الدالة الرئيسية
function Start-Backup {
    Show-Header
    
    Initialize-BackupDirectories
    
    switch ($BackupType) {
        "full" {
            Backup-Full
            Backup-Git
            Backup-Database
            Backup-Config
            Backup-Documentation
            $BackupDir = $FullBackupDir
        }
        "incremental" {
            Backup-Incremental
            Backup-Git
            $BackupDir = $IncrementalBackupDir
        }
        "git-only" {
            Backup-Git
            $BackupDir = $GitBackupDir
        }
        "daily" {
            Backup-Incremental
            Backup-Git
            Backup-Config
            $BackupDir = $DailyBackupDir
        }
        default {
            Write-ColorOutput "❌ نوع نسخ احتياطي غير صحيح!" $Colors.Error
            return
        }
    }
    
    # إنشاء Manifest
    $Manifest = Create-BackupManifest -BackupDir $BackupDir -Type $BackupType
    
    # ضغط النسخة
    $ZipPath = Compress-Backup -BackupDir $BackupDir
    
    # تنظيف القديم
    Cleanup-OldBackups -DaysToKeep 30
    
    # عرض التقرير
    Show-BackupReport -Manifest $Manifest -ZipPath $ZipPath
    
    Write-ColorOutput "`n════════════════════════════════════════════════════" $Colors.Header
}

# تشغيل النظام
Start-Backup
