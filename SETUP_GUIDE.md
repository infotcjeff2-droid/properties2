# 設置指南

## 第一步：安裝依賴

```bash
npm install
```

## 第二步：設置數據庫

### 選項 1: 使用本地 PostgreSQL

1. 確保已安裝 PostgreSQL
2. 創建數據庫：
```sql
CREATE DATABASE property_management;
```

3. 複製環境變數文件：
```bash
cp env.example .env
```

4. 編輯 `.env` 文件，設置數據庫連接：
```
DATABASE_URL="postgresql://username:password@localhost:5432/property_management?schema=public"
NEXTAUTH_SECRET="生成一個隨機字符串，例如：openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 選項 2: 使用 Supabase（推薦用於開發）

1. 前往 [supabase.com](https://supabase.com) 創建免費帳號
2. 創建新項目
3. 在項目設置中找到數據庫連接字符串
4. 複製到 `.env` 文件的 `DATABASE_URL`

## 第三步：初始化數據庫

```bash
# 生成 Prisma Client
npm run db:generate

# 推送數據庫結構（開發環境，會自動創建表）
npm run db:push

# 或使用遷移（生產環境推薦）
npm run db:migrate
```

## 第四步：創建初始管理員

運行種子腳本創建初始管理員帳號：

```bash
npm run db:seed
```

這會創建一個默認管理員：
- **電子郵件**: admin@example.com
- **密碼**: admin123
- **角色**: SUPER_ADMIN

⚠️ **重要**: 首次登入後請立即更改密碼！

## 第五步：啟動開發服務器

```bash
npm run dev
```

打開瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 使用系統

### 登入

使用創建的初始管理員帳號登入：
- 電子郵件: `admin@example.com`
- 密碼: `admin123`

### 創建公司（僅限 SUPER_ADMIN）

1. 登入後，訪問 `/admin` 頁面
2. 使用 API 或後續的 UI 創建公司

### 創建用戶（SUPER_ADMIN 或 COMPANY_ADMIN）

- **SUPER_ADMIN**: 可以創建任何公司的任何角色用戶
- **COMPANY_ADMIN**: 只能創建自己公司的 MANAGER 或 STAFF 用戶

## 角色說明

- **SUPER_ADMIN**: 超級管理員，可以創建公司和所有用戶
- **COMPANY_ADMIN**: 公司管理員，可以管理自己公司的用戶和數據
- **MANAGER**: 經理，可以查看和管理大部分數據
- **STAFF**: 員工，基礎權限

## 常見問題

### 數據庫連接錯誤

確保：
1. PostgreSQL 服務正在運行
2. `.env` 文件中的 `DATABASE_URL` 正確
3. 數據庫用戶有足夠權限

### Prisma 錯誤

如果遇到 Prisma 相關錯誤：
```bash
# 重新生成 Prisma Client
npm run db:generate

# 重置數據庫（⚠️ 會刪除所有數據）
npx prisma migrate reset
```

### 認證問題

如果無法登入：
1. 檢查 `.env` 文件中的 `NEXTAUTH_SECRET` 是否設置
2. 清除瀏覽器 cookies
3. 確認數據庫中用戶已正確創建

## 下一步

參考 [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) 了解完整的開發計劃和功能列表。

