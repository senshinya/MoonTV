// EdgeOne Pages Function for /api/search
// 从 src/app/api/search/route.ts 完整迁移而来

import {
  API_CONFIG,
  cleanHtmlTags,
  getApiSites,
  getCacheTime,
} from '../_shared/config.js';

// 根据环境变量决定最大搜索页数，默认 5
const MAX_SEARCH_PAGES = 5;

// 匹配 m3u8 链接的正则
const M3U8_PATTERN = /(https?:\/\/[^"'\s]+?\.m3u8)/g;

async function searchFromApi(apiSite, query) {
  const apiBaseUrl = apiSite.api;
  const apiName = apiSite.name;
  const searchUrl =
    apiBaseUrl + API_CONFIG.search.path + encodeURIComponent(query);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(searchUrl, {
      headers: API_CONFIG.search.headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`搜索请求失败: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.list || !Array.isArray(data.list)) {
      return [];
    }

    // 转换数据格式
    const results = data.list.map((item) => {
      let episodes = [];

      // 处理播放源拆分
      if (item.vod_play_url) {
        const playSources = item.vod_play_url.split('$$$');
        if (playSources.length > 0) {
          const mainSource = playSources[0];
          const episodeList = mainSource.split('#');
          episodes = episodeList
            .map((ep) => {
              const parts = ep.split('$');
              return parts.length > 1 ? parts[1] : '';
            })
            .filter(
              (url) =>
                url && (url.startsWith('http://') || url.startsWith('https://'))
            );
        }
      }

      // 如果播放源为空，则尝试从内容中解析 m3u8
      if (episodes.length === 0 && item.vod_content) {
        const matches = item.vod_content.match(M3U8_PATTERN) || [];
        episodes = matches.map((link) => link.replace(/^\$/, ''));
      }

      return {
        id: item.vod_id,
        title: item.vod_name,
        poster: item.vod_pic,
        episodes,
        source: apiSite.key,
        source_name: apiName,
        class: item.vod_class,
        year: item.vod_year ? item.vod_year.match(/\d{4}/)?.[0] || '' : '',
        desc: cleanHtmlTags(item.vod_content || ''),
        type_name: item.type_name,
      };
    });

    // 获取总页数
    const pageCount = data.pagecount || 1;
    // 确定需要获取的额外页数
    const pagesToFetch = Math.min(pageCount - 1, MAX_SEARCH_PAGES - 1);

    // 如果有额外页数，获取更多页的结果
    if (pagesToFetch > 0) {
      const additionalPagePromises = [];

      for (let page = 2; page <= pagesToFetch + 1; page++) {
        const pageUrl =
          apiBaseUrl +
          API_CONFIG.search.pagePath
            .replace('{query}', encodeURIComponent(query))
            .replace('{page}', page.toString());

        const pagePromise = fetch(pageUrl, {
          headers: API_CONFIG.search.headers,
          signal: controller.signal,
        })
          .then((res) => {
            if (!res.ok) throw new Error(`页面 ${page} 请求失败`);
            return res.json();
          })
          .then((pageData) => {
            if (!pageData || !pageData.list || !Array.isArray(pageData.list)) {
              return [];
            }

            return pageData.list.map((item) => {
              let episodes = [];

              if (item.vod_play_url) {
                const playSources = item.vod_play_url.split('$$$');
                if (playSources.length > 0) {
                  const mainSource = playSources[0];
                  const episodeList = mainSource.split('#');
                  episodes = episodeList
                    .map((ep) => {
                      const parts = ep.split('$');
                      return parts.length > 1 ? parts[1] : '';
                    })
                    .filter(
                      (url) =>
                        url &&
                        (url.startsWith('http://') ||
                          url.startsWith('https://'))
                    );
                }
              }

              if (episodes.length === 0 && item.vod_content) {
                const matches = item.vod_content.match(M3U8_PATTERN) || [];
                episodes = matches.map((link) => link.replace(/^\$/, ''));
              }

              return {
                id: item.vod_id,
                title: item.vod_name,
                poster: item.vod_pic,
                episodes,
                source: apiSite.key,
                source_name: apiName,
                class: item.vod_class,
                year: item.vod_year
                  ? item.vod_year.match(/\d{4}/)?.[0] || ''
                  : '',
                desc: cleanHtmlTags(item.vod_content || ''),
                type_name: item.type_name,
              };
            });
          })
          .catch(() => []); // 忽略单页错误

        additionalPagePromises.push(pagePromise);
      }

      // 等待所有额外页面的结果
      const additionalResults = await Promise.all(additionalPagePromises);
      const flattenedAdditionalResults = additionalResults.flat();

      return [...results, ...flattenedAdditionalResults];
    }

    return results;
  } catch (error) {
    clearTimeout(timeoutId);
    // 单个API失败不影响整体搜索
    return [];
  }
}

export async function onRequest(context) {
  const { request } = context;

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query) {
    const cacheTime = getCacheTime();
    return new Response(JSON.stringify({ results: [] }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${cacheTime}`,
      },
    });
  }

  const apiSites = getApiSites();
  const searchPromises = apiSites.map((site) => searchFromApi(site, query));

  try {
    const results = await Promise.all(searchPromises);
    const flattenedResults = results.flat();
    const cacheTime = getCacheTime();

    return new Response(JSON.stringify({ results: flattenedResults }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${cacheTime}`,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '搜索失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
