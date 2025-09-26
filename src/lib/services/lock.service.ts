import RedisManager from '../redis'

export class LockService {
  private static redis = RedisManager.getInstance()

  static async acquireLock(
    key: string, 
    expiry: number = 30000,
    retryCount: number = 3
  ): Promise<boolean> {
    const lockKey = `lock:${key}`
    const lockValue = `${Date.now()}-${Math.random()}`

    for (let i = 0; i < retryCount; i++) {
      const result = await this.redis.set(
        lockKey,
        lockValue,
        'PX',
        expiry,
        'NX'
      )

      if (result === 'OK') {
        console.log(`🔒 Lock acquired: ${key}`)
        return true
      }

      // Wait before retry
      if (i < retryCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)))
      }
    }

    console.warn(`⚠️  Failed to acquire lock: ${key}`)
    return false
  }

  static async releaseLock(key: string): Promise<void> {
    const lockKey = `lock:${key}`
    await this.redis.del(lockKey)
    console.log(`🔓 Lock released: ${key}`)
  }

  static async withLock<T>(
    key: string,
    operation: () => Promise<T>,
    expiry: number = 30000
  ): Promise<T> {
    const lockAcquired = await this.acquireLock(key, expiry)
    
    if (!lockAcquired) {
      throw new Error(`Unable to acquire lock for ${key}. Resource is busy.`)
    }

    try {
      console.log(`🔧 Executing operation with lock: ${key}`)
      return await operation()
    } finally {
      await this.releaseLock(key)
    }
  }

  static async isLocked(key: string): Promise<boolean> {
    const lockKey = `lock:${key}`
    const result = await this.redis.get(lockKey)
    return result !== null
  }

  static async getLockInfo(key: string): Promise<{ locked: boolean; ttl?: number }> {
    const lockKey = `lock:${key}`
    const [exists, ttl] = await Promise.all([
      this.redis.exists(lockKey),
      this.redis.pttl(lockKey)
    ])

    return {
      locked: exists === 1,
      ttl: ttl > 0 ? ttl : undefined
    }
  }
}