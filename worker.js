// Cloudflare Workers 版本的网易云音乐代理
import { NeteaseCloudMusicApi } from 'NeteaseCloudMusicApi';

// CORS 头部
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true'
};

// 处理 CORS 预检请求
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  return null;
}

// 主要的请求处理函数
export default {
  async fetch(request, env, ctx) {
    // 处理 CORS
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 健康检查
      if (path === '/health') {
        return new Response(JSON.stringify({
          status: 'ok',
          message: '网易云音乐代理服务器运行正常',
          timestamp: new Date().toISOString(),
          platform: 'Cloudflare Workers',
          version: '1.0.0'
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // API信息
      if (path === '/api' || path === '/') {
        return new Response(JSON.stringify({
          name: 'Netease Music Proxy API',
          version: '1.0.0',
          description: '网易云音乐API代理服务 - Cloudflare Workers版本',
          platform: 'Cloudflare Workers',
          endpoints: {
            health: '/health',
            api_info: '/api',
            music_apis: '/api/*'
          }
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 处理网易云音乐API请求
      if (path.startsWith('/api/')) {
        const apiPath = path.replace('/api/', '');
        
        // 获取请求参数
        const params = {};
        url.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // 处理POST请求的body
        if (request.method === 'POST') {
          const contentType = request.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const body = await request.json();
            Object.assign(params, body);
          } else if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await request.formData();
            for (const [key, value] of formData.entries()) {
              params[key] = value;
            }
          }
        }

        // 调用网易云音乐API
        const result = await callNeteaseAPI(apiPath, params);
        
        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 404 处理
      return new Response(JSON.stringify({
        code: 404,
        message: 'API not found',
        path: path
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        code: 500,
        message: 'Internal server error',
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};

// 调用网易云音乐API的函数
async function callNeteaseAPI(apiPath, params) {
  try {
    // 这里需要根据实际的NeteaseCloudMusicApi库来调用
    // 由于Cloudflare Workers环境限制，可能需要重新实现部分功能
    
    // 示例：处理常用的API
    switch (apiPath) {
      case 'song_url_v1':
      case 'song/url/v1':
        return await getSongUrl(params);
      case 'search':
        return await search(params);
      case 'song_detail':
      case 'song/detail':
        return await getSongDetail(params);
      default:
        // 对于其他API，可以代理到原始的网易云API
        return await proxyToNetease(apiPath, params);
    }
  } catch (error) {
    console.error('API call error:', error);
    return {
      code: 500,
      message: 'API调用失败',
      error: error.message
    };
  }
}

// 获取歌曲URL
async function getSongUrl(params) {
  const { id, level = 'exhigh' } = params;
  
  // 这里可以实现获取歌曲URL的逻辑
  // 或者代理到其他服务
  
  return {
    code: 200,
    data: [{
      id: parseInt(id),
      url: `https://music.example.com/song/${id}`,
      br: level === 'exhigh' ? 320000 : 128000,
      size: 0,
      md5: '',
      code: 200,
      expi: 1200,
      type: 'mp3',
      gain: 0,
      fee: 0,
      uf: null,
      payed: 0,
      flag: 0,
      canExtend: false,
      freeTrialInfo: null,
      level: level,
      encodeType: 'mp3'
    }]
  };
}

// 搜索功能
async function search(params) {
  const { keywords, type = 1, limit = 30, offset = 0 } = params;
  
  // 实现搜索逻辑
  return {
    code: 200,
    result: {
      songs: [],
      songCount: 0
    }
  };
}

// 获取歌曲详情
async function getSongDetail(params) {
  const { ids } = params;
  
  // 实现歌曲详情获取逻辑
  return {
    code: 200,
    songs: []
  };
}

// 代理到网易云原始API
async function proxyToNetease(apiPath, params) {
  // 这里可以实现代理逻辑
  return {
    code: 501,
    message: 'API not implemented yet',
    apiPath: apiPath
  };
}
