// src/app/api/bookings/[id]/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BookingService } from '../../../../../lib/services/booking.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { adminId } = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      );
    }

    await BookingService.confirmBooking(params.id, adminId);

    return NextResponse.json({
      message: 'Booking confirmed successfully',
      bookingId: params.id
    });
  } catch (error: any) {
    console.error('Error confirming booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm booking' },
      { status: 500 }
    );
  }
}