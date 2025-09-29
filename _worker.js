// Cloudflare Pages Functions 版本
// 文件路径: functions/_middleware.js

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true'
};

export async function onRequest(context) {
  const { request, env } = context;
  
  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  // 健康检查
  if (path === '/health') {
    return new Response(JSON.stringify({
      status: 'ok',
      message: '网易云音乐代理服务器运行正常',
      timestamp: new Date().toISOString(),
      platform: 'Cloudflare Pages',
      version: '1.0.0'
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  // 继续处理其他请求
  return await env.ASSETS.fetch(request);
}
