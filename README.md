# adCard

基于 **Next.js 15 + React 19 + TypeScript** 的 AI 聊天卡片项目，支持多角色对话、静态页面导出与 APNG 图片压缩优化。

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)

## 功能特性

- AI 多角色智能对话
- 多页面路由与静态导出
- 响应式设计，适配移动端与桌面端
- APNG 图片压缩（97%+ 压缩率）
- 现代化技术栈：Next.js 15 + React 19 + Tailwind CSS

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15、React 19 |
| UI | Ant Design、Tailwind CSS |
| 状态 | Zustand |
| 语言 | TypeScript |
| 图片处理 | Python + Pillow + OpenCV |

## 快速开始

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 构建与部署

```bash
npm run build
```

静态文件输出至 `out/` 目录，可部署至 Nginx、Vercel、Netlify 等。

## 页面路由

| 路径 | 功能 |
|------|------|
| `/` | 主页 |
| `/direct-chat?id=1` | AI 角色对话 |
| `/boxing` | 拳击展示页 |
| `/hotel-card` | 酒店房卡页 |
| `/links` | 导航页 |

## Author

**曹宁** · Full-stack / AI Application Developer

- GitHub: [@mozizhou](https://github.com/mozizhou)
- 相关项目: [ai-card-vue](https://github.com/mozizhou/ai-card-vue)

## License

MIT
