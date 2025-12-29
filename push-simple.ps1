# 簡單推送腳本
param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

Write-Host "正在推送..." -ForegroundColor Yellow

# 更新遠程 URL
git remote set-url properties2 "https://$Token@github.com/infotcjeff2-droid/properties2.git"

# 推送主分支
Write-Host "推送 main 分支..." -ForegroundColor Cyan
git push properties2 main

# 推送標籤
Write-Host "推送標籤 v1.0.1..." -ForegroundColor Cyan
git push properties2 v1.0.1

# 清除 token
git remote set-url properties2 https://github.com/infotcjeff2-droid/properties2.git

Write-Host "完成！" -ForegroundColor Green

