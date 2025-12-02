# سكريبت المزامنة التلقائية مع GitHub
# يقوم بجلب التحديثات من GitHub ودفع التغييرات المحلية

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "بدء المزامنة مع GitHub..." -ForegroundColor Cyan

# الانتقال لمجلد المستودع
Set-Location $PSScriptRoot

# مزامنة الـ submodules أولاً
Write-Host "`nفحص Submodules..." -ForegroundColor Cyan
$submodules = git submodule status 2>&1
if ($submodules -and $submodules -notlike "*fatal*") {
    Write-Host "تحديث Submodules..." -ForegroundColor Yellow
    git submodule update --init --recursive 2>&1 | Out-Null
    
    # التحقق من تغييرات داخل workspace
    if (Test-Path "workspace") {
        Push-Location workspace
        $submoduleStatus = git status --porcelain 2>&1
        if ($submoduleStatus -and $submoduleStatus -notlike "*fatal*") {
            Write-Host "`nتغييرات في workspace:" -ForegroundColor Green
            git status --short
            git add -A 2>&1 | Out-Null
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            git commit -m "Workspace sync: $timestamp" 2>&1 | Out-Null
            $pushResult = git push 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "تم رفع تغييرات workspace" -ForegroundColor Green
            }
        }
        Pop-Location
    }
}

# جلب آخر التحديثات من GitHub
Write-Host "`nجلب آخر التحديثات من GitHub..." -ForegroundColor Yellow
git fetch origin main 2>&1 | Out-Null

# التحقق من وجود تغييرات
$status = git status --porcelain
if ($status) {
    Write-Host "`nتم العثور على تغييرات محلية:" -ForegroundColor Green
    git status --short
    
    # عرض إحصائيات التغييرات
    $modifiedFiles = ($status | Where-Object { $_ -match '^ M' }).Count
    $addedFiles = ($status | Where-Object { $_ -match '^A|^\?\?' }).Count
    $deletedFiles = ($status | Where-Object { $_ -match '^ D' }).Count
    
    Write-Host "`nملخص التغييرات:" -ForegroundColor Cyan
    if ($modifiedFiles -gt 0) { Write-Host "   ملفات معدلة: $modifiedFiles" -ForegroundColor Yellow }
    if ($addedFiles -gt 0) { Write-Host "   ملفات جديدة: $addedFiles" -ForegroundColor Green }
    if ($deletedFiles -gt 0) { Write-Host "   ملفات محذوفة: $deletedFiles" -ForegroundColor Red }
    
    # إضافة جميع التغييرات
    Write-Host "`nإضافة التغييرات..." -ForegroundColor Yellow
    git add -A
    
    # عمل commit
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "حفظ التغييرات..." -ForegroundColor Yellow
    git commit -m "Auto sync: $timestamp" 2>&1 | Out-Null
}

# محاولة دمج التحديثات من GitHub
Write-Host "`nدمج التحديثات..." -ForegroundColor Yellow
$pullResult = git pull origin main --rebase 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nتعارض في الملفات! يرجى حل التعارضات يدوياً" -ForegroundColor Red
    Write-Host "استخدم: git status لرؤية الملفات المتعارضة" -ForegroundColor Yellow
    exit 1
}

# دفع التغييرات المحلية إلى GitHub
if ($status) {
    Write-Host "`nدفع التغييرات إلى GitHub..." -ForegroundColor Yellow
    $pushResult = git push origin main 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nتمت المزامنة بنجاح!" -ForegroundColor Green
    } else {
        Write-Host "`nفشل رفع التغييرات. تحقق من صلاحياتك على GitHub" -ForegroundColor Red
        Write-Host $pushResult
        exit 1
    }
} else {
    Write-Host "`nلا توجد تغييرات للمزامنة. كل شيء محدث!" -ForegroundColor Green
}

Write-Host "`nحالة المستودع:" -ForegroundColor Cyan
git log --oneline -5
