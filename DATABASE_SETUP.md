# 數據庫設置指南

## 問題診斷

根據日誌，系統缺少 `DATABASE_URL` 環境變數。請按照以下步驟設置：

## 步驟 1: 創建 .env 文件

在項目根目錄創建 `.env` 文件（如果還沒有），內容如下：

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/property_management?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# App
NODE_ENV="development"
```

## 步驟 2: 配置數據庫連接

將 `DATABASE_URL` 中的以下部分替換為您的實際值：
- `username`: PostgreSQL 用戶名（通常是 `postgres`）
- `password`: PostgreSQL 密碼
- `localhost:5432`: 數據庫主機和端口（如果不同請修改）
- `property_management`: 數據庫名稱（可以自定義）

### 示例：

```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/property_management?schema=public"
```

## 步驟 3: 生成 NEXTAUTH_SECRET

運行以下命令生成一個安全的隨機字符串：

**Windows PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**或者使用在線工具生成一個 32 字符的隨機字符串**

## 步驟 4: 初始化數據庫

設置好 `.env` 文件後，運行：

```bash
# 生成 Prisma Client
npm run db:generate

# 推送數據庫結構
npm run db:push

# 創建初始管理員
npm run db:seed
```

## 步驟 5: 重啟開發服務器

修改 `.env` 文件後，需要重啟開發服務器：

1. 停止當前服務器（Ctrl+C）
2. 運行 `npm run dev`

## 驗證設置

完成設置後，嘗試登入：
- 電子郵件: `admin@example.com`
- 密碼: `admin123`

## 常見問題

### 問題：無法連接到數據庫
- 確保 PostgreSQL 服務正在運行
- 檢查用戶名和密碼是否正確
- 確認端口號是否為 5432（PostgreSQL 默認端口）

### 問題：數據庫不存在
- 先創建數據庫：`CREATE DATABASE property_management;`
- 或者修改 `DATABASE_URL` 中的數據庫名稱

### 問題：權限錯誤
- 確保 PostgreSQL 用戶有創建表和插入數據的權限

