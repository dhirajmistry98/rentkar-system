import { connectToDatabase } from '../mongodb'
import { Partner } from '../types'
import { LockService } from './lock.service'
import { PubSubService } from './pubsub.service'
import RedisManager from '../redis'

export class PartnerService {
  private static redis = RedisManager.getInstance()

  static async findNearestAvailablePartner(
    latitude: number,
    longitude: number,
    city: string
  ): Promise<Partner | null> {
    try {
      const { db } = await connectToDatabase()

      const partner = await db.collection<Partner>('partners').findOne({
        city: city.toLowerCase(),
        status: 'online',
        $or: [
          { currentBookings: { $exists: false } },
          { currentBookings: { $size: 0 } }
        ],
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: 10000 // 10km radius
          }
        }
      })

      if (partner) {
        console.log(`🎯 Found nearest partner: ${partner.name} at distance from [${latitude}, ${longitude}]`)
      } else {
        console.log(`❌ No available partners found near [${latitude}, ${longitude}] in ${city}`)
      }

      return partner
    } catch (error) {
      console.error('Error finding nearest partner:', error)
      throw new Error('Failed to find available partner')
    }
  }

  static async updateGPS(
    partnerId: string,
    lat: number,
    lng: number
  ): Promise<void> {
    // Rate limiting check
    const rateLimitKey = `gps:rate:${partnerId}`
    const currentMinute = Math.floor(Date.now() / 60000)
    const rateLimitKeyWithTime = `${rateLimitKey}:${currentMinute}`
    
    const currentCount = await this.redis.incr(rateLimitKeyWithTime)
    
    if (currentCount === 1) {
      await this.redis.expire(rateLimitKeyWithTime, 60)
    }
    
    if (currentCount > 6) {
      throw new Error('Rate limit exceeded: Maximum 6 GPS updates per minute')
    }

    try {
      // Update partner location in database
      const { db } = await connectToDatabase()
      
      const updateResult = await db.collection('partners').updateOne(
        { _id: partnerId },
        {
          $set: {
            location: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            lastGpsUpdate: new Date()
          }
        }
      )

      if (updateResult.matchedCount === 0) {
        throw new Error(`Partner with ID ${partnerId} not found`)
      }

      console.log(`📍 GPS updated for partner ${partnerId}: [${lat}, ${lng}]`)

      // Broadcast update via pub/sub
      await PubSubService.publish('partner:gps:update', {
        partnerId,
        location: { lat, lng },
        timestamp: new Date().toISOString()
      })

      // Store recent GPS history in Redis (last 100 updates)
      const historyKey = `gps:history:${partnerId}`
      const gpsUpdate = JSON.stringify({
        lat,
        lng,
        timestamp: new Date().toISOString()
      })
      
      await this.redis.lpush(historyKey, gpsUpdate)
      await this.redis.ltrim(historyKey, 0, 99) // Keep only last 100 updates
      await this.redis.expire(historyKey, 86400) // Expire after 24 hours

    } catch (error) {
      console.error(`❌ Error updating GPS for partner ${partnerId}:`, error)
      throw error
    }
  }

  static async assignToBooking(partnerId: string, bookingId: string): Promise<void> {
    try {
      const { db } = await connectToDatabase()
      
      const updateResult = await db.collection('partners').updateOne(
        { _id: partnerId },
        {
          $addToSet: { currentBookings: bookingId },
          $set: { 
            status: 'busy',
            updatedAt: new Date()
          }
        }
      )

      if (updateResult.matchedCount === 0) {
        throw new Error(`Partner with ID ${partnerId} not found`)
      }

      console.log(`🤝 Partner ${partnerId} assigned to booking ${bookingId}`)

      // Broadcast assignment
      await PubSubService.publish('partner:booking:assigned', {
        partnerId,
        bookingId,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error(`❌ Error assigning partner ${partnerId} to booking ${bookingId}:`, error)
      throw error
    }
  }

  static async releaseFromBooking(partnerId: string, bookingId: string): Promise<void> {
    try {
      const { db } = await connectToDatabase()
      
      // Remove booking from partner's current bookings
      const updateResult = await db.collection('partners').updateOne(
        { _id: partnerId },
        {
          $pull: { currentBookings: bookingId },
          $set: { updatedAt: new Date() }
        }
      )

      if (updateResult.matchedCount === 0) {
        throw new Error(`Partner with ID ${partnerId} not found`)
      }

      // Check if partner has other bookings, if not set status to online
      const partner = await db.collection('partners').findOne({ _id: partnerId })
      
      if (partner && (!partner.currentBookings || partner.currentBookings.length === 0)) {
        await db.collection('partners').updateOne(
          { _id: partnerId },
          { $set: { status: 'online' } }
        )
      }

      console.log(`🔄 Partner ${partnerId} released from booking ${bookingId}`)

    } catch (error) {
      console.error(`❌ Error releasing partner ${partnerId} from booking ${bookingId}:`, error)
      throw error
    }
  }

  static async getGPSHistory(partnerId: string, limit: number = 50): Promise<any[]> {
    try {
      const historyKey = `gps:history:${partnerId}`
      const history = await this.redis.lrange(historyKey, 0, limit - 1)
      
      return history.map(item => JSON.parse(item))
    } catch (error) {
      console.error(`❌ Error getting GPS history for partner ${partnerId}:`, error)
      return []
    }
  }

  static async getPartnersByStatus(status?: string): Promise<Partner[]> {
    try {
      const { db } = await connectToDatabase()
      
      const filter = status ? { status } : {}
      const partners = await db.collection<Partner>('partners')
        .find(filter)
        .sort({ name: 1 })
        .toArray()

      return partners
    } catch (error) {
      console.error('Error fetching partners:', error)
      throw new Error('Failed to fetch partners')
    }
  }
}