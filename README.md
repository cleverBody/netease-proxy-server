# 网易云音乐API代理服务器

一个简单易用的网易云音乐API代理服务器，专为本地开发和API测试设计。支持Apifox、Postman等工具进行接口调试。

## 🚀 快速开始

### 1. 安装依赖
```bash
cd netease-proxy-server
npm install
```

### 2. 启动服务器
```bash
# 生产模式
npm start

# 开发模式（自动重启）
npm run dev
```

### 3. 验证服务
```bash
# 运行测试脚本
npm test

# 或者直接访问
curl http://localhost:3000/health
```

## 📡 服务信息

- **服务地址**: http://localhost:3000
- **API文档**: http://localhost:3000/api
- **健康检查**: http://localhost:3000/health

## 🔧 使用Apifox测试

### 1. 配置环境
1. 打开Apifox
2. 创建新项目或使用现有项目
3. 添加环境变量：
   - 变量名: `baseUrl`
   - 变量值: `http://localhost:3000`

### 2. 导入接口
访问 http://localhost:3000/api 查看完整的接口文档和示例。

### 3. 常用测试接口

#### 🎵 基础音乐接口

**搜索歌曲**
```
GET {{baseUrl}}/api/search?keywords=周杰伦&type=1&limit=10
```

**获取歌曲详情**
```
GET {{baseUrl}}/api/song/detail?ids=186016,186017
```

**获取播放链接**
```
GET {{baseUrl}}/api/song/url/v1?id=186016&level=exhigh
```

**获取歌词**
```
GET {{baseUrl}}/api/lyric?id=186016
```

#### 📋 歌单相关

**获取推荐歌单**
```
GET {{baseUrl}}/api/personalized?limit=10
```

**获取歌单详情**
```
GET {{baseUrl}}/api/playlist/detail?id=123456
```

**获取歌单所有歌曲**
```
GET {{baseUrl}}/api/playlist/track/all?id=123456&limit=100
```

#### 👤 用户相关

**手机号登录**
```
POST {{baseUrl}}/api/login/cellphone
Content-Type: application/json

{
  "phone": "13800138000",
  "password": "your_password"
}
```

**检查登录状态**
```
GET {{baseUrl}}/api/login/status
Cookie: MUSIC_U=your_token_here
```

**获取用户详情**
```
GET {{baseUrl}}/api/user/detail?uid=123456
```

#### 🎨 其他接口

**获取热搜榜**
```
GET {{baseUrl}}/api/search/hot
```

**获取搜索建议**
```
GET {{baseUrl}}/api/search/suggest?keywords=周杰
```

**获取每日推荐歌曲**
```
GET {{baseUrl}}/api/recommend/songs
Cookie: MUSIC_U=your_token_here
```

## 🔐 认证说明

### 需要登录的接口
某些接口需要用户登录才能访问，需要在请求头中添加Cookie：

```
Cookie: MUSIC_U=your_token_here
```

### 获取登录Token
1. 使用手机号登录接口获取Cookie
2. 从响应中提取MUSIC_U的值
3. 在后续请求中使用该Cookie

## 📊 响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    // 实际数据
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误信息",
  "code": 500,
  "path": "/api/example",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🧪 自动化测试

项目包含了完整的测试脚本，可以验证所有主要接口：

```bash
npm test
```

测试内容包括：
- ✅ 健康检查
- ✅ API文档获取
- ✅ 歌曲搜索
- ✅ 歌曲详情获取
- ✅ 播放链接获取
- ✅ 推荐歌单获取
- ✅ 歌词获取

## 🔍 调试技巧

### 1. 查看请求日志
服务器会输出详细的请求日志，包括：
- 请求方法和路径
- 请求参数
- API调用结果
- 错误信息

### 2. 使用开发模式
```bash
npm run dev
```
开发模式会自动重启服务器，方便调试。

### 3. 检查网易云API状态
如果某个接口返回错误，可能是：
- 网易云音乐API临时不可用
- 请求参数不正确
- 需要登录但未提供Cookie
- 网络连接问题

## 📝 常见问题

### Q: 为什么某些接口返回空数据？
A: 可能需要登录，请先调用登录接口获取Cookie。

### Q: 如何获取真实的歌曲ID？
A: 使用搜索接口，从返回结果中获取歌曲ID。

### Q: 播放链接为什么是空的？
A: 可能是版权限制或需要VIP权限，尝试其他歌曲。

### Q: 服务器启动失败？
A: 检查端口3000是否被占用，或修改package.json中的PORT环境变量。

## 🛠️ 自定义配置

### 修改端口
```bash
PORT=8080 npm start
```

### 添加新的API接口
在server.js中，所有NeteaseCloudMusicApi的接口都会自动注册。如果需要添加自定义逻辑，可以在相应位置添加中间件。

## 📄 许可证

MIT License - 仅供学习和研究使用。

## ⚠️ 免责声明

本项目仅供学习和研究使用，请遵守网易云音乐的服务条款。不得用于商业用途。
