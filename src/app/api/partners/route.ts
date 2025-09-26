import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    const partners = await db
      .collection('partners')
      .find({})
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json({
      success: true,
      data: partners
    })
  } catch (error: any) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const partner = await request.json()
    const { db } = await connectToDatabase()
    
    const result = await db.collection('partners').insertOne({
      ...partner,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...partner }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating partner:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create partner' },
      { status: 500 }
    )
  }
}