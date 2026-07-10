/**
 * API 配置
 * 本地开发时默认 localhost:8000
 * 部署到 Vercel 时，在 Vercel 项目设置中配置环境变量 NEXT_PUBLIC_API_URL
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';