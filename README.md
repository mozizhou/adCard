# AI Card 项目

这是一个基于 Next.js 的 AI 聊天卡片项目，支持多角色对话和静态页面展示。

## 🌟 功能特性

- 🤖 **AI 角色对话系统** - 支持多角色智能对话
- 🎨 **多页面路由支持** - 完整的页面导航系统
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🖼️ **APNG 图片压缩优化** - 97.1% 压缩率，极速加载
- 🚀 **静态页面导出** - 支持静态部署到任何服务器
- 🎯 **现代化技术栈** - Next.js 15 + React 19 + TypeScript

## 🛠️ 技术栈

- **前端框架**: Next.js 15
- **UI 库**: React 19, Ant Design
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **图片处理**: Python + Pillow + OpenCV
- **类型检查**: TypeScript
- **构建工具**: Next.js Build System

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://gitee.com/sun-yiyi-1/ai-card.git
cd ai-card
```

### 2. 安装依赖

```bash
npm install
```

### 3. 开发模式

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建静态页面

```bash
npm run build
```

构建完成后，静态文件将生成在 `out/` 目录中。

## 📁 项目结构

```
ai-card/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── direct-chat/       # AI 对话页面
│   │   ├── boxing/            # 拳击页面
│   │   ├── hotel-card/        # 酒店房卡页面
│   │   ├── links/             # 导航页面
│   │   └── ...
│   ├── components/            # React 组件
│   └── types/                 # TypeScript 类型定义
├── apng-processor/            # APNG 压缩工具
├── public/                    # 静态资源
├── out/                       # 构建输出 (npm run build 后生成)
└── 配置文件
```

## 🌐 页面路由

| 路径 | 功能 | 描述 |
|------|------|------|
| `/` | 主页 | 项目首页 |
| `/direct-chat?id=1` | AI 对话 | 与 ID=1 角色对话 |
| `/direct-chat?id=2` | AI 对话 | 与 ID=7 角色对话 (映射) |
| `/direct-chat?id=7` | 静态页面 | 显示静态内容 |
| `/boxing` | 拳击页面 | 展示拳击图片 |
| `/hotel-card` | 酒店房卡 | 酒店房卡页面 |
| `/links` | 导航页面 | 所有页面导航 |

## 🖼️ APNG 压缩工具

项目包含完整的 APNG 图片压缩工具链，实现了惊人的压缩效果：

### 压缩效果
- **原始大小**: 52.89 MB
- **压缩后**: 1.55 MB
- **压缩率**: 97.1%
- **质量**: 保持完整动画效果

### 使用方法
```bash
cd apng-processor
python process_webp_only.py
```

详细说明请查看 `apng-processor/README.md`

## 🚀 部署指南

### 静态部署 (推荐)

1. **构建静态页面**
```bash
npm run build
```

2. **部署到服务器**
```bash
# 将 out/ 目录内容上传到服务器
scp -r out/* user@your-server:/var/www/html/
```

3. **支持的部署平台**
- ✅ Nginx
- ✅ Apache
- ✅ Vercel
- ✅ Netlify
- ✅ GitHub Pages
- ✅ 任何静态文件服务器

详细部署说明请查看 [STATIC_DEPLOYMENT_GUIDE.md](./STATIC_DEPLOYMENT_GUIDE.md)

## 📊 性能优化

- ✅ **图片压缩**: APNG 压缩率达 97.1%
- ✅ **代码分割**: Next.js 自动代码分割
- ✅ **静态生成**: 预渲染所有页面
- ✅ **资源优化**: 自动压缩 CSS/JS
- ✅ **缓存策略**: 合理的缓存配置

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起 Pull Request

## 📄 许可证

MIT License

## 🔗 相关链接

- **Gitee 仓库**: https://gitee.com/sun-yiyi-1/ai-card
- **技术文档**: [STATIC_DEPLOYMENT_GUIDE.md](./STATIC_DEPLOYMENT_GUIDE.md)

---

🎉 **感谢使用 AI Card 项目！**
