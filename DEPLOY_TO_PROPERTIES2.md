# 部署到 properties2 倉庫指南

## 當前狀態
- 版本：v1.0.1
- 本地倉庫已準備好所有更改
- 遠程倉庫已設置：`properties2` → `https://github.com/infotcjeff2-droid/properties2.git`

## 推送步驟

### 方法 1：使用 Personal Access Token（推薦）

1. **創建 Personal Access Token**：
   - 訪問：https://github.com/settings/tokens
   - 點擊 "Generate new token (classic)"
   - 名稱：`properties2-deploy`
   - 權限：勾選 `repo`（完整倉庫權限）
   - 點擊 "Generate token"
   - **重要**：立即複製 token（只顯示一次）

2. **使用 token 推送**：
   ```bash
   # 推送主分支
   git push https://<YOUR_TOKEN>@github.com/infotcjeff2-droid/properties2.git main
   
   # 推送版本標籤
   git push https://<YOUR_TOKEN>@github.com/infotcjeff2-droid/properties2.git v1.0.1
   ```

3. **或者更新遠程 URL 包含 token**（一次性設置）：
   ```bash
   git remote set-url properties2 https://<YOUR_TOKEN>@github.com/infotcjeff2-droid/properties2.git
   git push properties2 main
   git push properties2 v1.0.1
   ```

### 方法 2：使用 GitHub CLI（如果已安裝）

```bash
gh auth login
git push properties2 main
git push properties2 v1.0.1
```

### 方法 3：手動上傳（如果上述方法都不行）

1. 在 GitHub 上創建新文件或使用網頁上傳
2. 或者使用 GitHub Desktop 應用

## 驗證推送

推送成功後，訪問以下 URL 確認：
- 倉庫：https://github.com/infotcjeff2-droid/properties2
- 標籤：https://github.com/infotcjeff2-droid/properties2/releases/tag/v1.0.1

## 當前提交記錄

```
6e2e90b (HEAD -> main, tag: v1.0.1) Update version to 1.0.1 in package.json
8babaf3 Version 1.0.1: Add dashboard menu item for admin, fix authentication and cookie handling
014b2fe Configure GitHub Pages deployment - Add workflow and static export config
```

## 包含的主要更改

- ✅ 添加儀表板菜單項（僅 admin 可見）
- ✅ 修復認證和 cookie 處理問題
- ✅ 更新版本號為 1.0.1
- ✅ 修復動態渲染配置
- ✅ 添加 Access Denied 頁面

