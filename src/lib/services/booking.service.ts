import { connectToDatabase } from '../mongodb'
import { Booking } from '../types'
import { LockService } from './lock.service'
import { PubSubService } from './pubsub.service'
import { PartnerService } from './partner.service'
import { ObjectId } from 'mongodb'

export class BookingService {
  static async assignPartner(bookingId: string, adminId: string): Promise<void> {
    await LockService.withLock(`booking:assign:${bookingId}`, async () => {
      const { db } = await connectToDatabase()
      
      // Get booking details
      const booking = await db.collection<Booking>('bookings').findOne({
        _id: new ObjectId(bookingId)
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      if (booking.partnerId) {
        throw new Error('Partner already assigned to this booking')
      }

      console.log(`🔍 Finding partner for booking ${bookingId} in ${booking.location}`)

      // Find nearest available partner
      const partner = await PartnerService.findNearestAvailablePartner(
        booking.address.latitude,
        booking.address.longitude,
        booking.location
      )

      if (!partner) {
        throw new Error(`No available partners found in ${booking.location}`)
      }

      // Update booking with partner
      const updateResult = await db.collection('bookings').updateOne(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            partnerId: partner._id,
            status: 'PARTNER_ASSIGNED',
            assignedBy: adminId,
            assignedAt: new Date(),
            updatedAt: new Date()
          }
        }
      )

      if (updateResult.matchedCount === 0) {
        throw new Error('Failed to update booking with partner assignment')
      }

      // Assign partner to booking
      await PartnerService.assignToBooking(partner._id, bookingId)

      console.log(`✅ Partner ${partner.name} assigned to booking ${bookingId}`)

      // Publish event
      await PubSubService.publish('booking:partner:assigned', {
        bookingId,
        partnerId: partner._id,
        partnerName: partner.name,
        assignedBy: adminId,
        timestamp: new Date().toISOString()
      })
    }, 30000) // 30 second timeout
  }

  static async reviewDocuments(
    bookingId: string,
    adminId: string,
    reviews: { docType: string; status: 'APPROVED' | 'REJECTED' }[]
  ): Promise<void> {
    await LockService.withLock(`booking:review:${bookingId}`, async () => {
      const { db } = await connectToDatabase()

      const booking = await db.collection<Booking>('bookings').findOne({
        _id: new ObjectId(bookingId)
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      // Validate reviews
      const invalidReviews = reviews.filter(review => 
        !booking.document.some(doc => doc.docType === review.docType)
      )

      if (invalidReviews.length > 0) {
        throw new Error(`Invalid document types: ${invalidReviews.map(r => r.docType).join(', ')}`)
      }

      // Update document statuses
      const updatedDocuments = booking.document.map(doc => {
        const review = reviews.find(r => r.docType === doc.docType)
        if (review) {
          return {
            ...doc,
            status: review.status,
            reviewedBy: adminId,
            reviewedAt: new Date()
          }
        }
        return doc
      })

      const updateResult = await db.collection('bookings').updateOne(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            document: updatedDocuments,
            status: 'DOCUMENTS_UNDER_REVIEW',
            reviewedBy: adminId,
            reviewedAt: new Date(),
            updatedAt: new Date()
          }
        }
      )

      if (updateResult.matchedCount === 0) {
        throw new Error('Failed to update booking with document reviews')
      }

      console.log(`📄 Documents reviewed for booking ${bookingId} by ${adminId}`)

      // Publish event
      await PubSubService.publish('booking:documents:reviewed', {
        bookingId,
        reviews,
        reviewedBy: adminId,
        timestamp: new Date().toISOString()
      })
    })
  }

  static async confirmBooking(bookingId: string, adminId: string): Promise<void> {
    await LockService.withLock(`booking:confirm:${bookingId}`, async () => {
      const { db } = await connectToDatabase()

      const booking = await db.collection<Booking>('bookings').findOne({
        _id: new ObjectId(bookingId)
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

      if (booking.status === 'CONFIRMED') {
        throw new Error('Booking already confirmed')
      }

      // Check if all documents are approved
      const allApproved = booking.document.every(doc => doc.status === 'APPROVED')
      if (!allApproved) {
        const pendingDocs = booking.document
          .filter(doc => doc.status !== 'APPROVED')
          .map(doc => doc.docType)
        throw new Error(`Cannot confirm booking. Pending documents: ${pendingDocs.join(', ')}`)
      }

      const updateResult = await db.collection('bookings').updateOne(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            status: 'CONFIRMED',
            confirmedBy: adminId,
            confirmedAt: new Date(),
            updatedAt: new Date()
          },
          $unset: {
            lockedBy: "",
            lockedAt: ""
          }
        }
      )

      if (updateResult.matchedCount === 0) {
        throw new Error('Failed to confirm booking')
      }

      console.log(`✅ Booking ${bookingId} confirmed by ${adminId}`)

      // Publish confirmation event
      await PubSubService.publish('booking:confirmed', {
        bookingId,
        confirmedBy: adminId,
        timestamp: new Date().toISOString()
      })
    })
  }

  static async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const { db } = await connectToDatabase()
      
      const booking = await db.collection<Booking>('bookings').findOne({
        _id: new ObjectId(bookingId)
      })

      return booking
    } catch (error) {
      console.error(`❌ Error fetching booking ${bookingId}:`, error)
      throw new Error('Failed to fetch booking')
    }
  }

  static async getBookings(
    filter: any = {},
    options: { limit?: number; skip?: number; sort?: any } = {}
  ): Promise<Booking[]> {
    try {
      const { db } = await connectToDatabase()
      
      const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options
      
      const bookings = await db.collection<Booking>('bookings')
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray()

      return bookings
    } catch (error) {
      console.error('❌ Error fetching bookings:', error)
      throw new Error('Failed to fetch bookings')
    }
  }

  static async getBookingStats(): Promise<{
    total: number
    pending: number
    partnerAssigned: number
    underReview: number
    confirmed: number
  }> {
    try {
      const { db } = await connectToDatabase()
      
      const pipeline = [
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]
      
      const results = await db.collection('bookings').aggregate(pipeline).toArray()
      
      const stats = {
        total: 0,
        pending: 0,
        partnerAssigned: 0,
        underReview: 0,
        confirmed: 0
      }

      results.forEach(result => {
        const status = result._id?.toLowerCase().replace('_', '') || 'unknown'
        const count = result.count || 0
        
        stats.total += count
        
        switch (status) {
          case 'pending':
            stats.pending = count
            break
          case 'partnerassigned':
            stats.partnerAssigned = count
            break
          case 'documentsunderreview':
            stats.underReview = count
            break
          case 'confirmed':
            stats.confirmed = count
            break
        }
      })

      return stats
    } catch (error) {
      console.error('❌ Error fetching booking stats:', error)
      throw new Error('Failed to fetch booking statistics')
    }
  }
}