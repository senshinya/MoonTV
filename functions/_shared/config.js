// 共享配置文件 - 从 config.json 和 src/lib/config.ts 迁移而来

export const API_CONFIG = {
  search: {
    path: '?ac=videolist&wd=',
    pagePath: '?ac=videolist&wd={query}&pg={page}',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  },
  detail: {
    path: '?ac=videolist&ids=',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  },
};

// API站点配置 - 从 config.json 复制
export const API_SITES = {
  dyttzy: {
    api: 'http://caiji.dyttzyapi.com/api.php/provide/vod',
    name: '电影天堂资源',
    detail: 'http://caiji.dyttzyapi.com',
  },
  ruyi: {
    api: 'https://cj.rycjapi.com/api.php/provide/vod',
    name: '如意资源',
  },
  heimuer: {
    api: 'https://json.heimuer.xyz/api.php/provide/vod',
    name: '黑木耳',
    detail: 'https://heimuer.tv',
  },
  bfzy: {
    api: 'https://bfzyapi.com/api.php/provide/vod',
    name: '暴风资源',
  },
  tyyszy: {
    api: 'https://tyyszy.com/api.php/provide/vod',
    name: '天涯资源',
  },
  ffzy: {
    api: 'http://ffzy5.tv/api.php/provide/vod',
    name: '非凡影视',
    detail: 'http://ffzy5.tv',
  },
  zy360: {
    api: 'https://360zy.com/api.php/provide/vod',
    name: '360资源',
  },
  iqiyi: {
    api: 'https://www.iqiyizyapi.com/api.php/provide/vod',
    name: 'iqiyi资源',
  },
  wolong: {
    api: 'https://wolongzyw.com/api.php/provide/vod',
    name: '卧龙资源',
  },
  hwba: {
    api: 'https://cjhwba.com/api.php/provide/vod',
    name: '华为吧资源',
  },
  jisu: {
    api: 'https://jszyapi.com/api.php/provide/vod',
    name: '极速资源',
    detail: 'https://jszyapi.com',
  },
  dbzy: {
    api: 'https://dbzy.tv/api.php/provide/vod',
    name: '豆瓣资源',
  },
  mozhua: {
    api: 'https://mozhuazy.com/api.php/provide/vod',
    name: '魔爪资源',
  },
  mdzy: {
    api: 'https://www.mdzyapi.com/api.php/provide/vod',
    name: '魔都资源',
  },
  zuid: {
    api: 'https://api.zuidapi.com/api.php/provide/vod',
    name: '最大资源',
  },
  yinghua: {
    api: 'https://m3u8.apiyhzy.com/api.php/provide/vod',
    name: '樱花资源',
  },
  wujin: {
    api: 'https://api.wujinapi.me/api.php/provide/vod',
    name: '无尽资源',
  },
  wwzy: {
    api: 'https://wwzy.tv/api.php/provide/vod',
    name: '旺旺短剧',
  },
  ikun: {
    api: 'https://ikunzyapi.com/api.php/provide/vod',
    name: 'iKun资源',
  },
};

// 缓存时间配置
export const CACHE_TIME = 7200; // 2小时

// 获取API站点列表
export function getApiSites() {
  return Object.entries(API_SITES).map(([key, site]) => ({
    ...site,
    key,
  }));
}

// 获取缓存时间
export function getCacheTime() {
  return CACHE_TIME;
}

// 清理HTML标签的函数
export function cleanHtmlTags(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, ' ')
    .trim();
}
