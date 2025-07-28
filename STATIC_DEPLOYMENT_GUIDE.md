# 静态页面部署指南

## 🚀 快速部署

### 1. 构建静态页面

```bash
# 安装依赖
npm install

# 构建静态页面
npm run build
```

构建完成后，静态文件将生成在 `out/` 目录中。

### 2. 部署到服务器

将 `out/` 目录中的所有文件上传到您的 Web 服务器根目录。

## 📁 构建输出结构

```
out/
├── index.html              # 主页
├── direct-chat.html        # AI 对话页面
├── boxing.html             # 拳击页面
├── hotel-card.html         # 酒店房卡页面
├── links.html              # 导航页面
├── login.html              # 登录页面
├── _next/                  # Next.js 静态资源
│   ├── static/            # 静态文件
│   └── ...
├── index/                  # 静态页面资源
│   ├── images/            # 图片资源
│   ├── plugins/           # 插件文件
│   └── ...
└── api/                    # API 路由（如果有）
```

## 🌐 部署选项

### 选项 1: Nginx 服务器

1. **上传文件**
```bash
# 将 out/ 目录内容上传到 Nginx 根目录
scp -r out/* user@your-server:/var/www/html/
```

2. **Nginx 配置** (`/etc/nginx/sites-available/ai-card`)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # 处理 Next.js 路由
    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    # 静态资源缓存
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 图片资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 30d;
        add_header Cache-Control "public";
    }

    # API 代理（如果需要）
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **启用站点**
```bash
sudo ln -s /etc/nginx/sites-available/ai-card /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 选项 2: Apache 服务器

1. **上传文件**
```bash
scp -r out/* user@your-server:/var/www/html/
```

2. **Apache 配置** (`.htaccess`)
```apache
RewriteEngine On

# 处理 Next.js 路由
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^([^.]+)$ $1.html [NC,L]

# 静态资源缓存
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|webp)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
</FilesMatch>

# 压缩
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### 选项 3: 云服务部署

#### Vercel (推荐)
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

#### Netlify
```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 部署
netlify deploy --prod --dir=out
```

#### GitHub Pages
1. 将 `out/` 目录内容推送到 `gh-pages` 分支
2. 在 GitHub 仓库设置中启用 GitHub Pages

## ⚙️ 构建配置

### next.config.ts
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/ai-card' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/ai-card' : '',
}

export default nextConfig
```

### package.json 脚本
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build && next export"
  }
}
```

## 🔧 部署脚本

### 自动部署脚本 (`deploy.sh`)
```bash
#!/bin/bash

echo "🚀 开始部署 AI Card 项目..."

# 1. 安装依赖
echo "📦 安装依赖..."
npm install

# 2. 构建项目
echo "🔨 构建静态页面..."
npm run build

# 3. 检查构建结果
if [ ! -d "out" ]; then
    echo "❌ 构建失败，out 目录不存在"
    exit 1
fi

echo "✅ 构建完成！"
echo "📁 静态文件位于 out/ 目录"
echo "🌐 可以将 out/ 目录内容上传到您的服务器"

# 4. 可选：自动上传到服务器
# rsync -avz --delete out/ user@your-server:/var/www/html/

echo "🎉 部署准备完成！"
```

## 📊 性能优化

### 1. 图片优化
- ✅ APNG 压缩已实现（97.1% 压缩率）
- ✅ WebP 格式支持
- ✅ 响应式图片

### 2. 代码分割
- ✅ Next.js 自动代码分割
- ✅ 动态导入
- ✅ 路由级别分割

### 3. 缓存策略
- ✅ 静态资源长期缓存
- ✅ HTML 文件短期缓存
- ✅ API 响应缓存

## 🔍 部署验证

### 检查清单
- [ ] 所有页面可正常访问
- [ ] 图片资源加载正常
- [ ] AI 对话功能正常
- [ ] 移动端适配正常
- [ ] 页面加载速度快

### 测试命令
```bash
# 本地测试静态文件
cd out
python -m http.server 8000
# 访问 http://localhost:8000

# 或使用 Node.js
npx serve out
```

## 🚨 常见问题

### Q: 页面 404 错误
**A:** 确保服务器配置了正确的重写规则，支持 HTML 扩展名。

### Q: 图片不显示
**A:** 检查图片路径是否正确，确保 `basePath` 配置正确。

### Q: API 调用失败
**A:** 静态部署不支持服务端 API，需要配置外部 API 服务器。

### Q: 样式丢失
**A:** 检查 CSS 文件路径，确保 `assetPrefix` 配置正确。

## 📞 技术支持

如果遇到部署问题，请检查：
1. Node.js 版本 >= 18
2. 构建日志中的错误信息
3. 浏览器控制台错误
4. 服务器配置是否正确

---

🎉 **AI Card 项目静态部署指南完成！**
