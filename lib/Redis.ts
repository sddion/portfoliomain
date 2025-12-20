import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be defined in environment variables')
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

/**
 * Cache utility for wrapping expensive operations
 * @param key Redis key
 * @param fetcher Async function to fetch data if cache miss
 * @param ttl Time to live in seconds (default 1 day)
 */
export async function getOrCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 86400
): Promise<T> {
  try {
    const cached = await redis.get<T>(key)
    if (cached) {
      console.log(`[Redis] Cache HIT for key: ${key}`)
      return cached
    }

    console.log(`[Redis] Cache MISS for key: ${key}. Fetching fresh data...`)
    const freshData = await fetcher()
    
    // Store in cache
    await redis.set(key, freshData, { ex: ttl })
    
    return freshData
  } catch (error) {
    console.error(`[Redis] Error accessing cache for key ${key}:`, error)
    // Fallback to fetcher on Redis failure
    return fetcher()
  }
}
