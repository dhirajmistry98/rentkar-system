'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, MapPin, User, Package, CreditCard } from 'lucide-react'

interface BookingDetail {
  _id: string
  userId: string
  packageId: string
  startDate: string
  endDate: string
  location: string
  status: string
  priceBreakDown: {
    basePrice: number
    deliveryCharge: number
    grandTotal: number
  }
  address: {
    buildingAreaName: string
    houseNumber: string
    streetAddress: string
    zip: string
  }
}

export default function BookingDetailPage() {
  const params = useParams()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleBooking: BookingDetail = {
        _id: params.id as string,
        userId: "68108f18d1224f8f22316a7b",
        packageId: "685612cd3225791ecbb86b6e",
        startDate: "2025-07-19T00:00:00.000Z",
        endDate: "2025-07-20T00:00:00.000Z",
        location: "mumbai",
        status: "CONFIRMED",
        priceBreakDown: {
          basePrice: 590,
          deliveryCharge: 250,
          grandTotal: 1580.02
        },
        address: {
          buildingAreaName: "Pooja Enclave",
          houseNumber: "A/603",
          streetAddress: "Kandivali West, Mumbai",
          zip: "400067"
        }
      }
      setBooking(sampleBooking)
      setLoading(false)
    }, 1000)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Booking not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild>
            <Link href="/bookings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Booking Details</h1>
            <p className="text-muted-foreground">#{booking._id}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm capitalize">{booking.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">User ID: {booking.userId}</span>
              </div>
              <div>
                <Badge variant="outline">{booking.status}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Price Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>₹{booking.priceBreakDown.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span>₹{booking.priceBreakDown.deliveryCharge}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Grand Total:</span>
                  <span>₹{booking.priceBreakDown.grandTotal}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{booking.address.houseNumber}, {booking.address.buildingAreaName}</p>
              <p>{booking.address.streetAddress}</p>
              <p>Pin: {booking.address.zip}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}