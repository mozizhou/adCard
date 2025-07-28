import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 生产模式：启用静态导出，禁用 API 代理
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true, // 关闭 Next.js 默认的图片优化
  },
  // 静态导出模式下移除 rewrites，因为它们不会工作
  // 如果需要 API 代理，请在部署时配置 Web 服务器
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*", // 前端请求路径
  //       destination: "http://47.99.131.58:8000/:path*", // 代理到后端
  //     },
  //   ];
  // },
};

export default nextConfig;
