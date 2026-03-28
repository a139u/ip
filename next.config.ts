import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  env: {
    // Mail.tm API 代理 URL
    // 生产环境部署时，需部署 workers/mail-proxy/index.js 到 Cloudflare Worker
    // 并将此 URL 替换为实际 Worker 地址，例如：https://your-domain.workers.dev
    NEXT_PUBLIC_MAIL_PROXY_URL: process.env.NEXT_PUBLIC_MAIL_PROXY_URL || "",
  },
};

export default nextConfig;
