# سكريبت المزامنة التلقائية مع GitHub
# يقوم بجلب التحديثات من GitHub ودفع التغييرات المحلية

Write-Host "🔄 بدء المزامنة مع GitHub..." -ForegroundColor Cyan

# الانتقال لمجلد المستودع
Set-Location $PSScriptRoot

# جلب آخر التحديثات من GitHub
Write-Host "`n📥 جلب آخر التحديثات من GitHub..." -ForegroundColor Yellow
git fetch origin copilot/develop-performance-tracking-app

# التحقق من وجود تعارضات
$status = git status --porcelain
if ($status) {
    Write-Host "`n📝 تم العثور على تغييرات محلية:" -ForegroundColor Green
    git status --short
    
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
$pullResult = git pull origin copilot/develop-performance-tracking-app --rebase 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️  تعارض في الملفات! يرجى حل التعارضات يدوياً" -ForegroundColor Red
    Write-Host "استخدم: git status لرؤية الملفات المتعارضة" -ForegroundColor Yellow
    exit 1
}

# دفع التغييرات المحلية إلى GitHub
if ($status) {
    Write-Host "`n📤 دفع التغييرات إلى GitHub..." -ForegroundColor Yellow
    git push origin copilot/develop-performance-tracking-app
    
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
