'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Badge } from '../../../../components/ui/badge'
import { Alert, AlertDescription } from '../../../../components/ui/alert'
import { ArrowLeft, Truck, MapPin, User, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface Partner {
  _id: string
  name: string
  location: string
  rating: number
  distance: number
  vehicleType: string
  status: string
  completedBookings: number
}

interface Booking {
  _id: string
  userId: string
  location: string
  status: string
  address: {
    buildingAreaName: string
    houseNumber: string
    streetAddress: string
  }
}

export default function AssignPartnerPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [availablePartners, setAvailablePartners] = useState<Partner[]>([])
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBookingAndPartners()
  }, [params.id])

  const fetchBookingAndPartners = async () => {
    try {
      // Fetch booking details
      const bookingRes = await fetch(`/api/bookings/${params.id}`)
      if (!bookingRes.ok) throw new Error('Failed to fetch booking')
      const bookingData = await bookingRes.json()
      setBooking(bookingData.data)

      // Fetch available partners for this location
      const partnersRes = await fetch(`/api/partners?location=${bookingData.data.location}&status=AVAILABLE`)
      if (!partnersRes.ok) throw new Error('Failed to fetch partners')
      const partnersData = await partnersRes.json()
      setAvailablePartners(partnersData.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignPartner = async () => {
    if (!selectedPartner) return
    
    setAssigning(true)
    try {
      const response = await fetch(`/api/bookings/${params.id}/assign-partner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerId: selectedPartner._id,
          adminId: 'admin-' + Math.random().toString(36).substr(2, 9)
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign partner')
      }

      // Redirect back to booking details with success message
      router.push(`/bookings/${params.id}?assigned=true`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAssigning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-500/30 border-t-blue-500 mb-6 mx-auto"></div>
          <p className="text-white text-xl font-semibold">Loading partners...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Link href={`/bookings/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Assign Partner</h1>
            <p className="text-gray-300">Booking #{booking?._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-500/20 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {booking && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Info */}
            <Card className="lg:col-span-1 bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-medium">{booking.location.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Address</p>
                  <p className="text-white text-sm">
                    {booking.address.houseNumber}, {booking.address.buildingAreaName}<br/>
                    {booking.address.streetAddress}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <Badge variant="outline" className="text-yellow-300 border-yellow-500/30">
                    {booking.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Available Partners */}
            <Card className="lg:col-span-2 bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Available Partners ({availablePartners.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availablePartners.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Available Partners</h3>
                    <p className="text-gray-400">No partners are currently available in {booking.location}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availablePartners.map((partner) => (
                      <Card 
                        key={partner._id}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedPartner?._id === partner._id 
                            ? 'bg-blue-500/20 border-blue-500/50' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                        onClick={() => setSelectedPartner(partner)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{partner.name}</h3>
                                <p className="text-sm text-gray-300">{partner.vehicleType}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-yellow-400">★ {partner.rating}</span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-400">{partner.completedBookings} completed</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-white">{partner.distance}km away</p>
                              <Badge variant="outline" className="text-green-300 border-green-500/30 mt-1">
                                {partner.status}
                              </Badge>
                            </div>
                          </div>
                          {selectedPartner?._id === partner._id && (
                            <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                              <div className="flex items-center gap-2 text-blue-300">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Selected Partner</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" asChild className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Link href={`/bookings/${params.id}`}>
              Cancel
            </Link>
          </Button>
          <Button
            onClick={handleAssignPartner}
            disabled={!selectedPartner || assigning}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            {assigning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Assigning Partner...
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 mr-2" />
                Assign Selected Partner
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}