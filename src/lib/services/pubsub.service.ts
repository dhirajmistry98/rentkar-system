import RedisManager from '../redis'

export class PubSubService {
  private static pubClient = RedisManager.getPubInstance()
  private static subClient = RedisManager.getSubInstance()
  private static subscribers = new Map<string, Set<(message: any) => void>>()

  static async publish(channel: string, message: any): Promise<number> {
    try {
      const messageStr = JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
        channel
      })
      
      const result = await this.pubClient.publish(channel, messageStr)
      console.log(`📡 Published to ${channel}:`, message)
      return result
    } catch (error) {
      console.error(`❌ Error publishing to ${channel}:`, error)
      throw error
    }
  }

  static subscribe(channel: string, callback: (message: any) => void): void {
    // Add callback to subscribers map
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set())
      
      // Subscribe to Redis channel
      this.subClient.subscribe(channel, (err) => {
        if (err) {
          console.error(`❌ Error subscribing to ${channel}:`, err)
        } else {
          console.log(`📻 Subscribed to ${channel}`)
        }
      })
    }
    
    this.subscribers.get(channel)!.add(callback)

    // Handle incoming messages
    this.subClient.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const parsedMessage = JSON.parse(message)
          const callbacks = this.subscribers.get(channel)
          
          if (callbacks) {
            callbacks.forEach(cb => {
              try {
                cb(parsedMessage)
              } catch (error) {
                console.error(`❌ Error in subscription callback for ${channel}:`, error)
              }
            })
          }
        } catch (error) {
          console.error(`❌ Error parsing message from ${channel}:`, error)
        }
      }
    })
  }

  static async unsubscribe(channel: string, callback?: (message: any) => void): Promise<void> {
    const callbacks = this.subscribers.get(channel)
    
    if (callbacks) {
      if (callback) {
        callbacks.delete(callback)
      } else {
        callbacks.clear()
      }

      // If no more callbacks, unsubscribe from Redis
      if (callbacks.size === 0) {
        await this.subClient.unsubscribe(channel)
        this.subscribers.delete(channel)
        console.log(`📴 Unsubscribed from ${channel}`)
      }
    }
  }

  static getActiveSubscriptions(): string[] {
    return Array.from(this.subscribers.keys())
  }

  static getSubscriberCount(channel: string): number {
    return this.subscribers.get(channel)?.size || 0
  }
}