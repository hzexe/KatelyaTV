/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { Search, RotateCw } from 'lucide-react';

import { SourceSearchInfo } from '@/lib/types';

export default function DebugPage() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{ 
    regular_results: any[]; 
    adult_results: any[]; 
    source_search_info: SourceSearchInfo[] 
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      // 获取用户认证信息
      const authInfo = typeof window !== 'undefined' ? 
        JSON.parse(localStorage.getItem('authInfo') || 'null') : null;
      
      // 构建请求头
      const headers: HeadersInit = {};
      if (authInfo?.username) {
        headers['Authorization'] = `Bearer ${authInfo.username}`;
      }
      
      // 添加时间戳参数避免缓存问题
      const timestamp = Date.now();
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query.trim())}&t=${timestamp}`, 
        { 
          headers: {
            ...headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '搜索失败');
      console.error('搜索失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化用时显示
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // 获取状态码的显示样式
  const getStatusStyle = (status: number) => {
    if (status === 0) return 'bg-gray-100 text-gray-800';
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
    if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800';
    if (status >= 500) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数据源调试页面</h1>
          <p className="text-gray-600">查看各个数据源的详细状态信息</p>
        </div>

        {/* 搜索表单 */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="输入搜索关键词..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RotateCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  搜索中...
                </>
              ) : (
                '搜索'
              )}
            </button>
          </div>
        </form>

        {/* 错误信息 */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">搜索失败</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 搜索结果 */}
        {searchResults && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">搜索结果</h2>
              <p className="mt-1 text-sm text-gray-500">
                找到 {searchResults.regular_results.length} 条常规结果，{searchResults.adult_results.length} 条成人内容结果
              </p>
            </div>

            {/* 数据源状态信息 */}
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">数据源状态详情</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        数据源
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态码
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        结果数
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        用时
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        错误信息
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.source_search_info.map((info, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {info.source_name} ({info.source_key})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(info.status)}`}>
                            {info.status === 0 ? '无响应' : info.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {info.data_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDuration(info.duration)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                          <div className="truncate" title={info.error || '无错误'}>
                            {info.error || '无错误'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {searchResults.source_search_info.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  暂无数据源状态信息
                </div>
              )}
            </div>

            {/* 详细信息（可展开） */}
            <div className="border-t border-gray-200">
              <button
                type="button"
                className="w-full px-6 py-4 text-left text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => {
                  // 可以添加展开/收起详细信息的功能
                }}
              >
                查看详细信息（JSON）
              </button>
              <div className="px-6 pb-6 hidden">
                <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(searchResults, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 说明信息 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">状态码说明</h3>
          <ul className="list-disc pl-5 space-y-1 text-blue-800">
            <li><span className="font-medium">200</span> - 请求成功</li>
            <li><span className="font-medium">404</span> - 资源未找到</li>
            <li><span className="font-medium">500</span> - 服务器内部错误</li>
            <li><span className="font-medium">0</span> - 无响应（可能是网络问题或请求未正确发送）</li>
          </ul>
          <div className="mt-4 text-sm text-blue-700">
            <p>如果看到状态码为0，通常表示：</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>网络连接问题</li>
              <li>请求超时</li>
              <li>跨域问题</li>
              <li>数据源服务器不可达</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}