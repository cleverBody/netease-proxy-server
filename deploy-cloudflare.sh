#!/bin/bash

# Cloudflare 部署脚本

echo "🚀 开始部署到 Cloudflare..."

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安装"
    echo "请运行: npm install -g wrangler"
    exit 1
fi

# 检查是否已登录
if ! wrangler whoami &> /dev/null; then
    echo "🔐 请先登录 Cloudflare:"
    wrangler login
fi

# 选择部署方式
echo "请选择部署方式:"
echo "1) Cloudflare Workers"
echo "2) Cloudflare Pages"
read -p "请输入选择 (1 或 2): " choice

case $choice in
    1)
        echo "📦 部署到 Cloudflare Workers..."
        
        # 发布到 Workers
        wrangler publish
        
        if [ $? -eq 0 ]; then
            echo "✅ 部署成功!"
            echo "🌐 访问地址: https://netease-music-proxy.your-subdomain.workers.dev"
        else
            echo "❌ 部署失败"
            exit 1
        fi
        ;;
    2)
        echo "📦 部署到 Cloudflare Pages..."
        
        # 创建 Pages 项目
        wrangler pages project create netease-music-proxy
        
        # 部署到 Pages
        wrangler pages publish . --project-name=netease-music-proxy
        
        if [ $? -eq 0 ]; then
            echo "✅ 部署成功!"
            echo "🌐 访问地址: https://netease-music-proxy.pages.dev"
        else
            echo "❌ 部署失败"
            exit 1
        fi
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo "🎉 部署完成!"
