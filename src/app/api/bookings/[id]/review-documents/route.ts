import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { adminId, reviews } = await request.json()

    if (!adminId || !reviews || !Array.isArray(reviews)) {
      return NextResponse.json(
        { error: 'Admin ID and reviews array are required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Find the booking
    const booking = await db.collection('bookings').findOne({
      _id: new ObjectId(params.id)
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if booking can be reviewed
    if (!['PARTNER_ASSIGNED', 'DOCUMENTS_UNDER_REVIEW'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'Booking cannot be reviewed in current status' },
        { status: 400 }
      )
    }

    // Update documents with review status
    const updatedDocuments = booking.document.map((doc: any) => {
      const review = reviews.find((r: any) => r.docType === doc.docType)
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

    // Update booking with reviewed documents
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          document: updatedDocuments,
          status: 'DOCUMENTS_UNDER_REVIEW',
          lockedBy: adminId,
          lockedAt: new Date(),
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Document review submitted successfully',
      bookingId: params.id,
      reviews: reviews.length
    })
  } catch (error: any) {
    console.error('Error reviewing documents:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to review documents' },
      { status: 500 }
    )
  }
}
