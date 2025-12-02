# سكريبت المزامنة التلقائية مع GitHub
# يقوم بجلب التحديثات من GitHub ودفع التغييرات المحلية

Write-Host "🔄 بدء المزامنة مع GitHub..." -ForegroundColor Cyan

# الانتقال لمجلد المستودع
Set-Location $PSScriptRoot

# مزامنة الـ submodules أولاً
Write-Host "`n🔄 فحص Submodules..." -ForegroundColor Cyan
$submodules = git submodule status
if ($submodules) {
    Write-Host "📦 تحديث Submodules..." -ForegroundColor Yellow
    git submodule update --init --recursive
    
    # التحقق من تغييرات داخل workspace
    if (Test-Path "workspace") {
        Push-Location workspace
        $submoduleStatus = git status --porcelain
        if ($submoduleStatus) {
            Write-Host "`n📝 تغييرات في workspace:" -ForegroundColor Green
            git status --short
            git add -A
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            git commit -m "Workspace sync: $timestamp"
            git push 2>&1 | Out-Null
            Write-Host "✅ تم رفع تغييرات workspace" -ForegroundColor Green
        }
        Pop-Location
    }
}

# جلب آخر التحديثات من GitHub
Write-Host "`n📥 جلب آخر التحديثات من GitHub..." -ForegroundColor Yellow
git fetch origin main

# التحقق من وجود تغييرات
$status = git status --porcelain
if ($status) {
    Write-Host "`n📝 تم العثور على تغييرات محلية:" -ForegroundColor Green
    git status --short
    
    # عرض إحصائيات التغييرات
    $modifiedFiles = ($status | Where-Object { $_ -match '^ M' }).Count
    $addedFiles = ($status | Where-Object { $_ -match '^A|^\?\?' }).Count
    $deletedFiles = ($status | Where-Object { $_ -match '^ D' }).Count
    
    Write-Host "`n📊 ملخص التغييرات:" -ForegroundColor Cyan
    if ($modifiedFiles -gt 0) { Write-Host "   • ملفات معدلة: $modifiedFiles" -ForegroundColor Yellow }
    if ($addedFiles -gt 0) { Write-Host "   • ملفات جديدة: $addedFiles" -ForegroundColor Green }
    if ($deletedFiles -gt 0) { Write-Host "   • ملفات محذوفة: $deletedFiles" -ForegroundColor Red }
    
    # إضافة جميع التغييرات
    Write-Host "`n➕ إضافة التغييرات..." -ForegroundColor Yellow
    git add -A
    
    # عمل commit
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "💾 حفظ التغييرات..." -ForegroundColor Yellow
    git commit -m "Auto sync: $timestamp"
}

# محاولة دمج التحديثات من GitHub
Write-Host "`n🔀 دمج التحديثات..." -ForegroundColor Yellow
$pullResult = git pull origin main --rebase 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️  تعارض في الملفات! يرجى حل التعارضات يدوياً" -ForegroundColor Red
    Write-Host "استخدم: git status لرؤية الملفات المتعارضة" -ForegroundColor Yellow
    exit 1
}

# دفع التغييرات المحلية إلى GitHub
if ($status) {
    Write-Host "`n📤 دفع التغييرات إلى GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ تمت المزامنة بنجاح!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ فشل رفع التغييرات. تحقق من صلاحياتك على GitHub" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n✅ لا توجد تغييرات للمزامنة. كل شيء محدث!" -ForegroundColor Green
}

Write-Host "`n📊 حالة المستودع:" -ForegroundColor Cyan
git log --oneline -5
