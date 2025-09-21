const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const NeteaseCloudMusicApi = require('NeteaseCloudMusicApi');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS配置 - 允许所有来源（方便本地测试）
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
}));

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '网易云音乐代理服务器运行正常',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// API信息接口
app.get('/api', (req, res) => {
  res.json({
    name: 'Netease Music Proxy API',
    version: '1.0.0',
    description: '网易云音乐API代理服务，支持Apifox测试',
    baseUrl: `http://localhost:${PORT}/api`,
    endpoints: {
      health: '/health',
      api_info: '/api',
      music_apis: '/api/*'
    },
    examples: [
      {
        name: '获取歌曲详情',
        method: 'GET',
        url: '/api/song/detail?ids=123456',
        description: '获取指定ID的歌曲详情'
      },
      {
        name: '搜索歌曲',
        method: 'GET',
        url: '/api/search?keywords=周杰伦&type=1&limit=10',
        description: '搜索歌曲'
      },
      {
        name: '获取歌曲播放链接',
        method: 'GET',
        url: '/api/song/url/v1?id=123456&level=exhigh',
        description: '获取歌曲播放链接'
      },
      {
        name: '获取歌单详情',
        method: 'GET',
        url: '/api/playlist/detail?id=123456',
        description: '获取歌单详情'
      },
      {
        name: '手机号登录',
        method: 'POST',
        url: '/api/login/cellphone',
        body: {
          phone: '13800138000',
          password: 'your_password'
        },
        description: '手机号密码登录'
      }
    ],
    notes: [
      '所有网易云音乐API都可以通过 /api/ 前缀访问',
      '支持GET和POST请求',
      '需要登录的接口请在Cookie中传递MUSIC_U参数',
      '建议使用Apifox等工具进行接口测试'
    ]
  });
});

// 错误处理函数
const handleApiError = (error, req, res) => {
  console.error(`API错误 [${req.method} ${req.path}]:`, error.message);

  if (error.status) {
    return res.status(error.status).json({
      success: false,
      error: error.message || '请求失败',
      code: error.status,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  }

  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试',
    path: req.path,
    timestamp: new Date().toISOString()
  });
};

// 动态注册所有网易云音乐API
console.log('正在注册网易云音乐API接口...');
let registeredCount = 0;

Object.keys(NeteaseCloudMusicApi).forEach(apiName => {
  const apiFunction = NeteaseCloudMusicApi[apiName];

  // 跳过非函数和特殊函数
  if (typeof apiFunction !== 'function' ||
      ['serveNcmApi', 'getModulesDefinitions'].includes(apiName)) {
    return;
  }

  // 将驼峰命名转换为路径格式
  const apiPath = apiName.replace(/([A-Z])/g, '/$1').toLowerCase().replace(/^\//, '');

  // API处理函数
  const handler = async (req, res) => {
    try {
      console.log(`调用API: ${apiName} [${req.method}] ${req.path}`);
      console.log('请求参数:', { query: req.query, body: req.body });

      // 合并查询参数和请求体
      const params = {
        ...req.query,
        ...req.body,
        // 传递Cookie用于认证
        cookie: req.headers.cookie || '',
        // 添加时间戳防止缓存
        timestamp: Date.now()
      };

      // 调用网易云音乐API
      const result = await apiFunction(params);

      console.log(`API调用成功: ${apiName}, 状态码: ${result.status}`);

      if (result && result.body) {
        res.json({
          success: true,
          data: result.body,
          timestamp: new Date().toISOString()
        });
      } else {
        res.json({
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      handleApiError(error, req, res);
    }
  };

  // 注册GET和POST路由
  app.get(`/api/${apiPath}`, handler);
  app.post(`/api/${apiPath}`, handler);

  // 兼容下划线格式的路由
  if (apiName.includes('_')) {
    app.get(`/api/${apiName}`, handler);
    app.post(`/api/${apiName}`, handler);
  }

  // 特殊路径映射：将下划线格式转换为斜杠格式，用于兼容桌面端
  if (apiName.startsWith('album_')) {
    const slashPath = apiName.replace(/^album_/, 'album/');
    app.get(`/api/${slashPath}`, handler);
    app.post(`/api/${slashPath}`, handler);
  }

  if (apiName.startsWith('playlist_')) {
    const slashPath = apiName.replace(/^playlist_/, 'playlist/');
    app.get(`/api/${slashPath}`, handler);
    app.post(`/api/${slashPath}`, handler);
  }

  if (apiName.startsWith('artist_')) {
    const slashPath = apiName.replace(/^artist_/, 'artist/');
    app.get(`/api/${slashPath}`, handler);
    app.post(`/api/${slashPath}`, handler);
  }

  if (apiName.startsWith('toplist_')) {
    const slashPath = apiName.replace(/^toplist_/, 'toplist/');
    app.get(`/api/${slashPath}`, handler);
    app.post(`/api/${slashPath}`, handler);
  }

  registeredCount++;
});

console.log(`✅ 成功注册 ${registeredCount} 个API接口`);

// 引入解锁功能
const { getNeteaseSongUrl, getKuwoSongUrl } = require('./unblock.js');

// 解锁接口
app.get('/api/unblock', (req, res) => {
  res.json({
    name: 'UnblockAPI',
    description: 'SPlayer Mobile UnblockAPI service',
    author: '@imsyy',
    content: '部分接口采用 @939163156 by GD音乐台(music.gdstudio.xyz)，仅供本人学习使用，不可传播下载内容，不可用于商业用途。',
    endpoints: {
      netease: '/api/unblock/netease?id=歌曲ID',
      kuwo: '/api/unblock/kuwo?keyword=歌曲名-歌手名'
    }
  });
});

// 网易云解锁
app.get('/api/unblock/netease', async (req, res) => {
  try {
    const { id } = req.query;
    console.log(`解锁网易云歌曲: ${id}`);
    const result = await getNeteaseSongUrl(id);
    res.json(result);
  } catch (error) {
    handleApiError(error, req, res);
  }
});

// 酷我解锁
app.get('/api/unblock/kuwo', async (req, res) => {
  try {
    const { keyword } = req.query;
    console.log(`解锁酷我歌曲: ${keyword}`);
    const result = await getKuwoSongUrl(keyword);
    res.json(result);
  } catch (error) {
    handleApiError(error, req, res);
  }
});

console.log('🔓 解锁功能已启用');

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `路径 ${req.originalUrl} 不存在`,
    available_endpoints: {
      health: '/health',
      api_info: '/api',
      example: '/api/song/detail?ids=123456'
    },
    timestamp: new Date().toISOString()
  });
});

// 全局错误处理
app.use((error, req, res, next) => {
  handleApiError(error, req, res);
});

// 启动服务器 (仅在非Vercel环境下)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('\n🚀 网易云音乐代理服务器启动成功!');
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🔍 API文档: http://localhost:${PORT}/api`);
    console.log(`❤️  健康检查: http://localhost:${PORT}/health`);
    console.log('\n📋 常用测试接口:');
    console.log(`   歌曲详情: http://localhost:${PORT}/api/song/detail?ids=123456`);
    console.log(`   搜索歌曲: http://localhost:${PORT}/api/search?keywords=周杰伦&type=1`);
    console.log(`   播放链接: http://localhost:${PORT}/api/song/url/v1?id=123456&level=exhigh`);
    console.log(`   歌单详情: http://localhost:${PORT}/api/playlist/detail?id=123456`);
    console.log('\n🔧 使用Apifox测试:');
    console.log(`   1. 导入BaseURL: http://localhost:${PORT}`);
    console.log(`   2. 访问 /api 查看完整接口文档`);
    console.log(`   3. 开始测试各个接口\n`);
  });

  // 优雅关闭
  process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('\n收到SIGINT信号，正在关闭服务器...');
    process.exit(0);
  });
}

module.exports = app;
