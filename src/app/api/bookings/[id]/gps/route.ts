import { NextRequest, NextResponse } from 'next/server';
import { PartnerService } from '@/lib/services/partner.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { lat, lng } = await request.json();

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    await PartnerService.updateGPS(params.id, lat, lng);

    return NextResponse.json({
      message: 'GPS location updated successfully',
      partnerId: params.id,
      location: { lat, lng }
    });
  } catch (error: any) {
    console.error('Error updating GPS:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update GPS location' },
      { status: error.message.includes('Rate limit') ? 429 : 500 }
    );
  }
}