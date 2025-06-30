// EdgeOne Pages Function for /api/douban
// 从 src/app/api/douban/route.ts 完整迁移而来

import { getCacheTime } from '../_shared/config.js';

async function fetchDoubanData(url) {
  // 添加超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

  // 设置请求选项，包括信号和头部
  const fetchOptions = {
    signal: controller.signal,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      Referer: 'https://movie.douban.com/',
      Accept: 'application/json, text/plain, */*',
    },
  };

  try {
    // 尝试直接访问豆瓣API
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function handleTop250(pageStart) {
  const target = `https://movie.douban.com/top250?start=${pageStart}&filter=`;

  // 直接使用 fetch 获取 HTML 页面
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const fetchOptions = {
    signal: controller.signal,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      Referer: 'https://movie.douban.com/',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    },
  };

  try {
    const fetchResponse = await fetch(target, fetchOptions);
    clearTimeout(timeoutId);

    if (!fetchResponse.ok) {
      throw new Error(`HTTP error! Status: ${fetchResponse.status}`);
    }

    // 获取 HTML 内容
    const html = await fetchResponse.text();

    // 使用正则表达式提取电影信息
    const moviePattern =
      /<div class="item">[\s\S]*?<img[^>]+alt="([^"]+)"[^>]*src="([^"]+)"[\s\S]*?<span class="rating_num"[^>]*>([^<]+)<\/span>[\s\S]*?<\/div>/g;
    const movies = [];
    let match;

    while ((match = moviePattern.exec(html)) !== null) {
      const title = match[1];
      const cover = match[2];
      const rate = match[3] || '';

      // 处理图片 URL，确保使用 HTTPS
      const processedCover = cover.replace(/^http:/, 'https:');

      movies.push({
        title: title,
        poster: processedCover,
        rate: rate,
      });
    }

    const apiResponse = {
      code: 200,
      message: '获取成功',
      list: movies,
    };

    const cacheTime = getCacheTime();
    return new Response(JSON.stringify(apiResponse), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${cacheTime}`,
      },
    });
  } catch (error) {
    clearTimeout(timeoutId);
    return new Response(
      JSON.stringify({
        error: '获取豆瓣 Top250 数据失败',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function onRequest(context) {
  const { request } = context;

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const tag = url.searchParams.get('tag');
  const pageSize = parseInt(url.searchParams.get('pageSize') || '16');
  const pageStart = parseInt(url.searchParams.get('pageStart') || '0');

  // 验证参数
  if (!type || !tag) {
    return new Response(
      JSON.stringify({ error: '缺少必要参数: type 或 tag' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (!['tv', 'movie'].includes(type)) {
    return new Response(
      JSON.stringify({ error: 'type 参数必须是 tv 或 movie' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (pageSize < 1 || pageSize > 100) {
    return new Response(
      JSON.stringify({ error: 'pageSize 必须在 1-100 之间' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (pageStart < 0) {
    return new Response(JSON.stringify({ error: 'pageStart 不能小于 0' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (tag === 'top250') {
    return handleTop250(pageStart);
  }

  const target = `https://movie.douban.com/j/search_subjects?type=${type}&tag=${tag}&sort=recommend&page_limit=${pageSize}&page_start=${pageStart}`;

  try {
    // 调用豆瓣 API
    const doubanData = await fetchDoubanData(target);

    // 转换数据格式
    const list = doubanData.subjects.map((item) => ({
      title: item.title,
      poster: item.cover,
      rate: item.rate,
    }));

    const response = {
      code: 200,
      message: '获取成功',
      list: list,
    };

    const cacheTime = getCacheTime();
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${cacheTime}`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: '获取豆瓣数据失败',
        details: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
