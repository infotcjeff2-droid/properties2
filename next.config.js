/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 啟用靜態導出以支持 GitHub Pages
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/properties2' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/properties2' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // 跳過動態路由的靜態生成檢查（在構建時）
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig

