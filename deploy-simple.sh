#!/bin/bash

echo "🚀 开始部署网易云音乐代理到 Cloudflare Workers..."

# 检查是否在正确的目录
if [ ! -f "wrangler.toml" ]; then
    echo "❌ 请在 netease-proxy-server 目录下运行此脚本"
    exit 1
fi

# 检查 wrangler 是否安装
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装"
    echo "请运行: npm install -g wrangler"
    exit 1
fi

echo "✅ Wrangler CLI 已安装"

# 检查是否已登录
echo "🔐 检查登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "📝 需要登录 Cloudflare，即将打开浏览器..."
    echo "如果浏览器没有自动打开，请手动访问显示的URL"
    wrangler login
    
    if [ $? -ne 0 ]; then
        echo "❌ 登录失败"
        exit 1
    fi
fi

echo "✅ 已登录 Cloudflare"

# 部署
echo "📦 开始部署..."
wrangler publish

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功!"
    echo ""
    echo "📋 部署信息:"
    echo "   项目名称: netease-music-proxy"
    echo "   访问地址: https://netease-music-proxy.你的用户名.workers.dev"
    echo ""
    echo "🔧 接下来的步骤:"
    echo "1. 复制上面的访问地址"
    echo "2. 在 SPlayer 中将 API 地址从 'https://wyy.331106.xyz' 改为你的 Workers 地址"
    echo "3. 享受更快的播放速度！"
    echo ""
else
    echo "❌ 部署失败"
    echo "请检查错误信息并重试"
    exit 1
fi
