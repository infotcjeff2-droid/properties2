# 快速推送指南

## 🚀 最簡單的方法（推薦）

### 步驟 1：創建 Personal Access Token
1. 訪問：https://github.com/settings/tokens
2. 點擊 **"Generate new token (classic)"**
3. 填寫：
   - **Note**: `properties2-deploy`
   - **Expiration**: 選擇合適的過期時間（建議 90 天）
   - **Select scopes**: 勾選 ✅ **`repo`**（完整倉庫權限）
4. 點擊 **"Generate token"**
5. **立即複製 token**（只顯示一次！）

### 步驟 2：運行推送腳本
在 PowerShell 中運行：
```powershell
.\push-to-properties2.ps1
```

腳本會提示您輸入 token，然後自動完成所有推送操作。

---

## 📋 手動推送方法

如果您不想使用腳本，可以手動執行：

```powershell
# 1. 更新遠程 URL（替換 <YOUR_TOKEN> 為實際 token）
git remote set-url properties2 https://<YOUR_TOKEN>@github.com/infotcjeff2-droid/properties2.git

# 2. 推送主分支
git push properties2 main

# 3. 推送版本標籤
git push properties2 v1.0.1

# 4. 清除 URL 中的 token（安全考慮）
git remote set-url properties2 https://github.com/infotcjeff2-droid/properties2.git
```

---

## ✅ 驗證推送

推送成功後，訪問：
- **倉庫主頁**: https://github.com/infotcjeff2-droid/properties2
- **版本標籤**: https://github.com/infotcjeff2-droid/properties2/releases/tag/v1.0.1

---

## 📦 當前版本信息

- **版本**: v1.0.1
- **主要更改**:
  - ✅ 添加儀表板菜單項（僅 admin 可見）
  - ✅ 修復認證和 cookie 處理
  - ✅ 更新配置和依賴

---

## ❓ 遇到問題？

如果遇到權限錯誤：
1. 確認 token 有 `repo` 權限
2. 確認 token 未過期
3. 確認倉庫 `infotcjeff2-droid/properties2` 存在且您有寫入權限

如果遇到其他問題，請查看 `DEPLOY_TO_PROPERTIES2.md` 獲取更多詳細信息。

