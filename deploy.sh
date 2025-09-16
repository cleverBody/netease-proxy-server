#!/bin/bash

# 网易云音乐API代理服务部署脚本
# 支持部署到Vercel和Render

set -e

echo "🚀 网易云音乐API代理服务部署脚本"
echo "=================================="

# 检查是否安装了必要的工具
check_dependencies() {
    echo "📋 检查依赖..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装，请先安装 npm"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git 未安装，请先安装 Git"
        exit 1
    fi
    
    echo "✅ 依赖检查完成"
}

# 安装项目依赖
install_dependencies() {
    echo "📦 安装项目依赖..."
    npm install
    echo "✅ 依赖安装完成"
}

# 本地测试
test_local() {
    echo "🧪 本地测试..."
    echo "启动本地服务器进行测试..."
    
    # 启动服务器并在后台运行
    npm start &
    SERVER_PID=$!
    
    # 等待服务器启动
    sleep 5
    
    # 测试健康检查接口
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ 本地测试通过"
    else
        echo "❌ 本地测试失败"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    
    # 停止服务器
    kill $SERVER_PID 2>/dev/null || true
    sleep 2
}

# 部署到Vercel
deploy_vercel() {
    echo "🌐 部署到Vercel..."
    
    # 检查是否安装了Vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo "📥 安装Vercel CLI..."
        npm install -g vercel
    fi
    
    # 登录Vercel (如果未登录)
    echo "🔐 检查Vercel登录状态..."
    if ! vercel whoami &> /dev/null; then
        echo "请登录Vercel..."
        vercel login
    fi
    
    # 部署到生产环境
    echo "🚀 部署到Vercel生产环境..."
    vercel --prod
    
    echo "✅ Vercel部署完成！"
    echo "📡 你的API现在可以通过Vercel URL访问"
}

# 部署到Render (需要GitHub仓库)
deploy_render() {
    echo "🌐 准备部署到Render..."
    
    # 检查是否有Git仓库
    if [ ! -d ".git" ]; then
        echo "📁 初始化Git仓库..."
        git init
        git add .
        git commit -m "Initial commit for Render deployment"
    fi
    
    # 检查是否有远程仓库
    if ! git remote get-url origin &> /dev/null; then
        echo "⚠️  请先设置GitHub远程仓库："
        echo "   1. 在GitHub创建新仓库"
        echo "   2. 运行: git remote add origin https://github.com/yourusername/netease-music-proxy.git"
        echo "   3. 运行: git push -u origin main"
        echo "   4. 然后在Render控制台连接GitHub仓库进行部署"
        exit 1
    fi
    
    # 推送到GitHub
    echo "📤 推送代码到GitHub..."
    git add .
    git commit -m "Deploy to Render" || echo "没有新的更改"
    git push origin main
    
    echo "✅ 代码已推送到GitHub"
    echo "📋 接下来的步骤："
    echo "   1. 访问 https://render.com"
    echo "   2. 点击 'New +' → 'Web Service'"
    echo "   3. 连接你的GitHub仓库"
    echo "   4. 使用以下配置："
    echo "      - Build Command: npm install"
    echo "      - Start Command: npm start"
    echo "      - Environment: Node"
    echo "   5. 点击 'Create Web Service'"
}

# 显示菜单
show_menu() {
    echo ""
    echo "请选择部署选项："
    echo "1) 本地测试"
    echo "2) 部署到Vercel"
    echo "3) 部署到Render"
    echo "4) 全部 (测试 + Vercel + Render准备)"
    echo "5) 退出"
    echo ""
}

# 主函数
main() {
    check_dependencies
    install_dependencies
    
    while true; do
        show_menu
        read -p "请输入选项 (1-5): " choice
        
        case $choice in
            1)
                test_local
                ;;
            2)
                test_local
                deploy_vercel
                ;;
            3)
                test_local
                deploy_render
                ;;
            4)
                test_local
                deploy_vercel
                deploy_render
                ;;
            5)
                echo "👋 退出部署脚本"
                exit 0
                ;;
            *)
                echo "❌ 无效选项，请重新选择"
                ;;
        esac
        
        echo ""
        read -p "按Enter键继续..."
    done
}

# 运行主函数
main
