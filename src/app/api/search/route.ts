import { NextResponse } from 'next/server';

import { getAvailableApiSites,getCacheTime } from '@/lib/config';
import { addCorsHeaders, handleOptionsRequest } from '@/lib/cors';
import { getStorage } from '@/lib/db';
import { searchFromApi } from '@/lib/downstream';

export const runtime = 'edge';

// 处理OPTIONS预检请求（OrionTV客户端需要）
export async function OPTIONS() {
  return handleOptionsRequest();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  // 从 Authorization header 或 query parameter 获取用户名
  let userName: string | undefined = searchParams.get('user') || undefined;
  if (!userName) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      userName = authHeader.substring(7);
    }
  }

  if (!query) {
    const cacheTime = await getCacheTime();
    const response = NextResponse.json(
      { 
        regular_results: [],
        adult_results: []
      },
      {
        headers: {
          'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
          'CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
          'Vercel-CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
        },
      }
    );
    return addCorsHeaders(response);
  }

  try {
    // 检查是否明确要求包含成人内容（用于关闭过滤时的明确请求）
    const includeAdult = searchParams.get('include_adult') === 'true';
    console.log(`成人内容过滤 - 明确请求包含成人内容: ${includeAdult}`);
    
    // 获取用户的成人内容过滤设置
    let shouldFilterAdult = true; // 默认过滤
    if (userName) {
      try {
        const storage = getStorage();
        const userSettings = await storage.getUserSettings(userName);
        // 如果用户设置存在且明确设为false，则不过滤；否则默认过滤
        shouldFilterAdult = userSettings?.filter_adult_content !== false;
        console.log(`成人内容过滤 - 用户 ${userName} 设置: ${shouldFilterAdult ? '过滤' : '不过滤'}`);
      } catch (error) {
        // 出错时默认过滤成人内容
        shouldFilterAdult = true;
        console.error('成人内容过滤 - 获取用户设置失败:', error);
      }
    } else {
      console.log('成人内容过滤 - 未提供用户名，使用默认过滤策略');
    }

    // 根据用户设置和明确请求决定最终的过滤策略
    const finalShouldFilter = shouldFilterAdult || !includeAdult;
    console.log(`成人内容过滤 - 最终过滤策略: ${finalShouldFilter ? '过滤' : '不过滤'}`);
    
    // 使用动态过滤方法，但不依赖缓存，实时获取设置
    const availableSites = finalShouldFilter 
      ? await getAvailableApiSites(true) // 过滤成人内容
      : await getAvailableApiSites(false); // 不过滤成人内容
    
    console.log(`成人内容过滤 - 可用数据源数量: ${availableSites.length}`);
    if (finalShouldFilter) {
      console.log('成人内容过滤 - 已过滤掉成人内容数据源');
    }
    
    if (!availableSites || availableSites.length === 0) {
      const cacheTime = await getCacheTime();
      const response = NextResponse.json({ 
        regular_results: [], 
        adult_results: [] 
      }, {
        headers: {
          'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
          'CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
          'Vercel-CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
        },
      });
      return addCorsHeaders(response);
    }

    // 搜索所有可用的资源站（已根据用户设置动态过滤）
    const searchPromises = availableSites.map((site) => searchFromApi(site, query));
    const searchResults = (await Promise.all(searchPromises)).flat();

    // 如果搜索结果为空，记录各数据源的搜索情况
    if (searchResults.length === 0) {
      console.log('未找到匹配结果，各数据源搜索情况:');
      for (const site of availableSites) {
        try {
          const results = await searchFromApi(site, query);
          console.log(`数据源 ${site.name} (${site.key}): ${results.length} 条结果`);
        } catch (error) {
          console.error(`数据源 ${site.name} (${site.key}) 搜索失败:`, error);
        }
      }
    }

    // 所有结果都作为常规结果返回，因为成人内容源已经在源头被过滤掉了
    const cacheTime = await getCacheTime();
    const response = NextResponse.json(
      { 
        regular_results: searchResults,
        adult_results: [] // 始终为空，因为成人内容在源头就被过滤了
      },
      {
        headers: {
          'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
          'CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
          'Vercel-CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
        },
      }
    );
    return addCorsHeaders(response);
  } catch (error) {
    console.error('搜索接口发生错误:', error);
    const response = NextResponse.json(
      { 
        regular_results: [],
        adult_results: [],
        error: '搜索失败' 
      }, 
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
