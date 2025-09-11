/**
 * 限制并发执行的工具函数
 * 
 * 该函数用于控制并发执行的任务数量，避免在低性能设备上因过多并发请求导致超时
 * 
 * @param tasks 要执行的任务数组，每个任务应该是一个返回Promise的函数
 * @param limit 最大并发数，默认为5
 * @returns 返回所有任务执行结果的数组
 */
export async function limitConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit = 5
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  
  // 创建一个信号量来控制并发数
  const semaphore = {
    count: 0,
    queue: [] as ((value: unknown) => void)[]
  };
  
  // 获取信号量
  const acquire = (): Promise<void> => {
    return new Promise((resolve) => {
      if (semaphore.count < limit) {
        semaphore.count++;
        resolve();
      } else {
        semaphore.queue.push(resolve as (value: unknown) => void);
      }
    });
  };
  
  // 释放信号量
  const release = (): void => {
    semaphore.count--;
    if (semaphore.queue.length > 0) {
      semaphore.count++;
      const resolve = semaphore.queue.shift();
      if (resolve) resolve(undefined);
    }
  };
  
  // 执行所有任务
  const promises = tasks.map(async (task, index) => {
    await acquire();
    try {
      const result = await task();
      results[index] = result;
    } finally {
      release();
    }
  });
  
  await Promise.all(promises);
  return results;
}

/**
 * 带重试机制的异步任务执行函数
 * 
 * 该函数用于执行可能失败的异步任务，并在特定错误情况下进行重试
 * 
 * @param task 要执行的任务函数
 * @param retries 重试次数，默认为3
 * @param delay 重试延迟（毫秒），默认为1000ms
 * @param isRetryableError 判断错误是否可重试的函数，默认只对AbortError进行重试
 * @returns 任务执行结果
 */
export async function retryableTask<T>(
  task: () => Promise<T>,
  retries = 3,
  delay = 1000,
  isRetryableError: (error: unknown) => boolean = (error: unknown): boolean => {
    // 默认只对AbortError（超时）进行重试
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    
    const err = error as { name?: string; message?: string; code?: string };
    return err.name === 'AbortError' || 
           (err.message && (err.message.includes('aborted') || err.message.includes('timeout'))) ||
           err.code === 'ETIMEDOUT';
  }
): Promise<T> {
  let lastError: unknown;
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      
      // 如果不是最后一次重试且错误是可重试的，则等待后重试
      if (i < retries && isRetryableError(error)) {
        // console.log(`任务执行失败，${delay}ms后进行第${i + 1}次重试:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // 如果是最后一次重试或错误不可重试，则抛出错误
      throw error;
    }
  }
  
  throw lastError;
}