# SaaS 物業管理系統

一個完整的 SaaS 物業管理系統，支持多租戶架構，提供物業租賃管理全流程解決方案。

## 功能特色

- 🔐 多層級權限管理（Super Admin, Company Admin, Manager, Staff）
- 🏢 多租戶支持（Multi-tenant）
- 📊 管理儀表板
- 🏠 房源管理
- 📄 線上合約管理
- 💰 帳務自動化
- 🔧 修繕管理
- 👥 租客管理
- 📱 響應式設計

## 技術棧

- **前端**: Next.js 14, TypeScript, Tailwind CSS
- **後端**: Next.js API Routes
- **數據庫**: PostgreSQL + Prisma ORM
- **認證**: JWT (自定義實現)

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設置環境變數

複製 `.env.example` 並創建 `.env` 文件：

```bash
cp .env.example .env
```

編輯 `.env` 文件，設置數據庫連接：

```
DATABASE_URL="postgresql://user:password@localhost:5432/property_management?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. 設置數據庫

```bash
# 生成 Prisma Client
npm run db:generate

# 推送數據庫結構（開發環境）
npm run db:push

# 或使用遷移（生產環境）
npm run db:migrate
```

### 4. 創建初始管理員帳號

運行以下腳本創建初始管理員（需要先設置數據庫）：

```bash
# 創建一個 seed 腳本或手動在數據庫中創建
```

### 5. 啟動開發服務器

```bash
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000) 查看應用。

## 項目結構

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── dashboard/         # 儀表板頁面
│   ├── login/             # 登入頁面
│   └── layout.tsx         # 根布局
├── lib/                   # 工具函數
│   ├── auth.ts            # 認證相關
│   ├── auth-utils.ts      # 認證工具
│   └── prisma.ts          # Prisma Client
├── prisma/                # Prisma 配置
│   └── schema.prisma      # 數據庫模型
└── public/                # 靜態文件
```

## 權限系統

### 角色說明

- **SUPER_ADMIN**: 超級管理員，可以創建公司和所有用戶
- **COMPANY_ADMIN**: 公司管理員，可以管理自己公司的用戶和數據
- **MANAGER**: 經理，可以查看和管理大部分數據
- **STAFF**: 員工，基礎權限

### 創建初始管理員

在數據庫中手動創建或使用 seed 腳本：

```sql
-- 使用 bcrypt 生成密碼哈希（例如：password123）
-- 然後插入用戶
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'clx...',
  'admin@example.com',
  '$2a$12$...', -- bcrypt hash of password
  'Admin User',
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
```

## 開發計劃

詳細的開發計劃請參考 [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)

## 環境要求

- Node.js 18+
- PostgreSQL 14+
- npm 或 yarn

## 許可證

MIT

