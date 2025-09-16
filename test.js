const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// 测试用例
const testCases = [
  {
    name: '健康检查',
    method: 'GET',
    url: '/health',
    description: '检查服务器是否正常运行'
  },
  {
    name: '获取API信息',
    method: 'GET',
    url: '/api',
    description: '获取API文档和使用说明'
  },
  {
    name: '搜索歌曲',
    method: 'GET',
    url: '/api/search',
    params: {
      keywords: '周杰伦',
      type: 1,
      limit: 5
    },
    description: '搜索周杰伦的歌曲'
  },
  {
    name: '获取歌曲详情',
    method: 'GET',
    url: '/api/song/detail',
    params: {
      ids: '186016,186017'
    },
    description: '获取指定歌曲的详细信息'
  },
  {
    name: '获取歌曲播放链接',
    method: 'GET',
    url: '/api/song/url/v1',
    params: {
      id: '186016',
      level: 'standard'
    },
    description: '获取歌曲的播放链接'
  },
  {
    name: '获取推荐歌单',
    method: 'GET',
    url: '/api/personalized',
    params: {
      limit: 5
    },
    description: '获取推荐歌单'
  },
  {
    name: '获取歌词',
    method: 'GET',
    url: '/api/lyric',
    params: {
      id: '186016'
    },
    description: '获取歌曲歌词'
  }
];

// 执行测试
async function runTests() {
  console.log('🧪 开始测试网易云音乐代理API...\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`📋 测试 ${i + 1}/${totalTests}: ${test.name}`);
    console.log(`   描述: ${test.description}`);
    
    try {
      const config = {
        method: test.method,
        url: `${BASE_URL}${test.url}`,
        timeout: 10000
      };

      if (test.params) {
        if (test.method === 'GET') {
          config.params = test.params;
        } else {
          config.data = test.params;
        }
      }

      const startTime = Date.now();
      const response = await axios(config);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`   ✅ 成功 (${duration}ms)`);
      console.log(`   状态码: ${response.status}`);
      
      // 显示部分响应数据
      if (response.data) {
        if (response.data.success !== undefined) {
          console.log(`   响应: success=${response.data.success}`);
        }
        if (response.data.data) {
          const dataKeys = Object.keys(response.data.data);
          console.log(`   数据字段: ${dataKeys.slice(0, 3).join(', ')}${dataKeys.length > 3 ? '...' : ''}`);
        }
      }
      
      passedTests++;
    } catch (error) {
      console.log(`   ❌ 失败`);
      if (error.response) {
        console.log(`   状态码: ${error.response.status}`);
        console.log(`   错误: ${error.response.data?.error || error.response.statusText}`);
      } else if (error.request) {
        console.log(`   错误: 无法连接到服务器`);
      } else {
        console.log(`   错误: ${error.message}`);
      }
    }
    
    console.log('');
  }

  console.log(`🎯 测试完成: ${passedTests}/${totalTests} 通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！API代理服务运行正常。');
  } else {
    console.log('⚠️  部分测试失败，请检查服务器状态。');
  }
}

// 检查服务器是否启动
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

// 主函数
async function main() {
  console.log('🔍 检查服务器状态...');
  
  const isServerRunning = await checkServer();
  
  if (!isServerRunning) {
    console.log('❌ 服务器未启动或无法连接');
    console.log('请先运行: npm start 或 npm run dev');
    process.exit(1);
  }
  
  console.log('✅ 服务器运行正常\n');
  await runTests();
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTests, checkServer };
