import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

class RedisManager {
  private static instance: Redis
  private static pubInstance: Redis
  private static subInstance: Redis

  static getInstance(): Redis {
    if (!this.instance) {
      this.instance = new Redis(REDIS_URL, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
      })

      this.instance.on('connect', () => {
        console.log('✅ Redis connected')
      })

      this.instance.on('error', (error) => {
        console.error('❌ Redis connection error:', error)
      })
    }
    return this.instance
  }

  static getPubInstance(): Redis {
    if (!this.pubInstance) {
      this.pubInstance = new Redis(REDIS_URL, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
      })
    }
    return this.pubInstance
  }

  static getSubInstance(): Redis {
    if (!this.subInstance) {
      this.subInstance = new Redis(REDIS_URL, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
      })
    }
    return this.subInstance
  }

  static async closeConnections() {
    if (this.instance) {
      await this.instance.quit()
      console.log('📴 Redis instance closed')
    }
    if (this.pubInstance) {
      await this.pubInstance.quit()
      console.log('📴 Redis pub instance closed')
    }
    if (this.subInstance) {
      await this.subInstance.quit()
      console.log('📴 Redis sub instance closed')
    }
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await RedisManager.closeConnections()
  process.exit(0)
})

export default RedisManager