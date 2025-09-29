const axios = require('axios');
const { encryptQuery } = require('./kwDES.js');

/**
 * 直接获取 网易云云盘 链接
 * Thank @939163156
 * Power by GD音乐台(music.gdstudio.xyz)
 */
const getNeteaseSongUrl = async (id) => {
  try {
    if (!id) return { code: 404, url: null };
    const baseUrl = "https://music-api.gdstudio.xyz/api.php";
    const result = await axios.get(baseUrl, {
      params: { types: "url", id },
      timeout: 10000 // 增加超时时间到10秒
    });
    const songUrl = result.data.url;
    console.log("🔗 NeteaseSongUrl URL:", songUrl);
    return { code: 200, url: songUrl };
  } catch (error) {
    console.error("❌ Get NeteaseSongUrl Error:", error.message);
    return { code: 404, url: null };
  }
};

/**
 * 获取酷我音乐歌曲 ID
 */
const getKuwoSongId = async (keyword) => {
  try {
    const url = `http://search.kuwo.cn/r.s?&correct=1&stype=comprehensive&encoding=utf8&rformat=json&mobi=1&show_copyright_off=1&searchapi=6&all=${encodeURIComponent(keyword)}`;
    const result = await axios.get(url, { timeout: 10000 });
    
    if (
      !result.data ||
      !result.data.content ||
      result.data.content.length < 2 ||
      !result.data.content[1].musicpage ||
      !result.data.content[1].musicpage.abslist ||
      result.data.content[1].musicpage.abslist.length < 1
    ) {
      return null;
    }
    
    // 获取歌曲信息
    const songInfo = result.data.content[1].musicpage.abslist[0];
    const songId = songInfo.MUSICRID;
    const songName = songInfo.SONGNAME;
    
    // 是否与原曲吻合
    const originalName = keyword?.split("-")[0] || keyword;
    if (songName && !songName.includes(originalName)) {
      console.log(`歌曲名不匹配: ${songName} vs ${originalName}`);
      return null;
    }
    
    return songId.replace("MUSIC_", "");
  } catch (error) {
    console.error("❌ Get KuwoSongId Error:", error.message);
    return null;
  }
};

/**
 * 获取酷我音乐歌曲 URL
 */
const getKuwoSongUrl = async (keyword) => {
  try {
    if (!keyword) return { code: 404, url: null };
    
    const songId = await getKuwoSongId(keyword);
    if (!songId) return { code: 404, url: null };
    
    // 请求地址
    const PackageName = "kwplayer_ar_5.1.0.0_B_jiakong_vh.apk";
    const queryString = `corp=kuwo&source=${PackageName}&p2p=1&type=convert_url2&sig=0&format=mp3&rid=${songId}`;
    const url = `http://mobi.kuwo.cn/mobi.s?f=kuwo&q=${encryptQuery(queryString)}`;
    
    const result = await axios.get(url, {
      headers: {
        'User-Agent': 'okhttp/3.10.0'
      },
      timeout: 10000 // 增加超时时间到10秒
    });
    
    if (!result.data || !result.data.url) {
      return { code: 404, url: null };
    }
    
    console.log("🔗 KuwoSongUrl URL:", result.data.url);
    return { code: 200, url: result.data.url };
  } catch (error) {
    console.error("❌ Get KuwoSongUrl Error:", error.message);
    return { code: 404, url: null };
  }
};

module.exports = {
  getNeteaseSongUrl,
  getKuwoSongUrl
};