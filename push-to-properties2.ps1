# 推送代碼到 properties2 倉庫的腳本
# 使用方法：在 PowerShell 中運行此腳本，並輸入您的 Personal Access Token

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "推送代碼到 properties2 倉庫" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 檢查是否已設置遠程倉庫
$remoteExists = git remote | Select-String "properties2"
if (-not $remoteExists) {
    Write-Host "正在添加遠程倉庫..." -ForegroundColor Yellow
    git remote add properties2 https://github.com/infotcjeff2-droid/properties2.git
}

# 提示用戶輸入 Personal Access Token
Write-Host "請輸入您的 GitHub Personal Access Token:" -ForegroundColor Yellow
Write-Host "(如果還沒有，請訪問: https://github.com/settings/tokens 創建一個)" -ForegroundColor Gray
Write-Host ""
$token = Read-Host "Token" -AsSecureString
$tokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
)

if ([string]::IsNullOrWhiteSpace($tokenPlain)) {
    Write-Host "錯誤: Token 不能為空" -ForegroundColor Red
    exit 1
}

# 更新遠程 URL 包含 token
Write-Host ""
Write-Host "正在更新遠程 URL..." -ForegroundColor Yellow
$remoteUrl = "https://$tokenPlain@github.com/infotcjeff2-droid/properties2.git"
git remote set-url properties2 $remoteUrl

# 推送主分支
Write-Host ""
Write-Host "正在推送 main 分支..." -ForegroundColor Yellow
$pushMain = git push properties2 main 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ main 分支推送成功" -ForegroundColor Green
} else {
    Write-Host "✗ main 分支推送失敗" -ForegroundColor Red
    Write-Host $pushMain
    exit 1
}

# 推送標籤
Write-Host ""
Write-Host "正在推送版本標籤 v1.0.1..." -ForegroundColor Yellow
$pushTag = git push properties2 v1.0.1 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 標籤 v1.0.1 推送成功" -ForegroundColor Green
} else {
    Write-Host "✗ 標籤推送失敗" -ForegroundColor Red
    Write-Host $pushTag
    exit 1
}

# 清除遠程 URL 中的 token（安全考慮）
Write-Host ""
Write-Host "正在清除遠程 URL 中的 token（安全考慮）..." -ForegroundColor Yellow
git remote set-url properties2 https://github.com/infotcjeff2-droid/properties2.git

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ 推送完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "請訪問以下 URL 確認：" -ForegroundColor Cyan
Write-Host "  https://github.com/infotcjeff2-droid/properties2" -ForegroundColor White
Write-Host "  https://github.com/infotcjeff2-droid/properties2/releases/tag/v1.0.1" -ForegroundColor White
Write-Host ""

