import { NextRequest, NextResponse } from 'next/server'
import { PartnerService } from '@/lib/services/partner.service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { lat, lng } = await request.json()

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'Invalid coordinates. Latitude and longitude must be numbers.' },
        { status: 400 }
      )
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.' },
        { status: 400 }
      )
    }

    await PartnerService.updateGPS(params.id, lat, lng)

    return NextResponse.json({
      success: true,
      message: 'GPS location updated successfully',
      partnerId: params.id,
      location: { lat, lng }
    })
  } catch (error: any) {
    console.error('Error updating GPS:', error)
    
    const statusCode = error.message.includes('Rate limit') ? 429 : 500
    
    return NextResponse.json(
      { error: error.message || 'Failed to update GPS location' },
      { status: statusCode }
    )
  }
}