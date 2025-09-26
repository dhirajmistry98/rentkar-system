'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Badge } from '../../../../components/ui/badge'
import { Alert, AlertDescription } from '../../../../components/ui/alert'
import { ArrowLeft, CheckCircle, AlertCircle, FileText, User, MapPin, Calendar } from 'lucide-react'

interface Document {
  docType: 'SELFIE' | 'SIGNATURE'
  docLink: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewedBy?: string
  reviewedAt?: Date
}

interface Booking {
  _id: string
  userId: string
  location: string
  status: string
  startDate: string
  endDate: string
  document: Document[]
  address: {
    buildingAreaName: string
    houseNumber: string
    streetAddress: string
  }
  priceBreakDown: {
    grandTotal: number
  }
  partnerId?: string
}

export default function ConfirmBookingPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBooking()
  }, [params.id])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch booking')
      const data = await response.json()
      setBooking(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmBooking = async () => {
    setConfirming(true)
    try {
      const response = await fetch(`/api/bookings/${params.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: 'admin-' + Math.random().toString(36).substr(2, 9)
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm booking')
      }

      // Redirect back to booking details with success message
      router.push(`/bookings/${params.id}?confirmed=true`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setConfirming(false)
    }
  }

  const canConfirm = booking?.document.every(doc => doc.status === 'APPROVED')

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-500/30 border-t-blue-500 mb-6 mx-auto"></div>
          <p className="text-white text-xl font-semibold">Loading booking...</p>
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
            <h1 className="text-3xl font-bold text-white">Confirm Booking</h1>
            <p className="text-gray-300">Booking #{booking?._id.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-500/20 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {!canConfirm && (
          <Alert className="mb-6 bg-orange-500/20 border-orange-500/30">
            <AlertCircle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-300">
              All documents must be approved before confirming the booking.
            </AlertDescription>
          </Alert>
        )}

        {booking && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Booking Summary */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <p className="text-gray-400 text-sm">Duration</p>
                    </div>
                    <p className="text-white font-medium">
                      {new Date(booking.startDate).toLocaleDateString()} - 
                      {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-red-400" />
                      <p className="text-gray-400 text-sm">Location</p>
                    </div>
                    <p className="text-white font-medium">{booking.location.toUpperCase()}</p>
                  </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    <p className="text-gray-400 text-sm">Delivery Address</p>
                  </div>
                  <p className="text-white text-sm">
                    {booking.address.houseNumber}, {booking.address.buildingAreaName}<br/>
                    {booking.address.streetAddress}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30">
                  <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-green-400">
                    ₹{booking.priceBreakDown.grandTotal.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Document Status */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Verification Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {booking.document.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={doc.docLink} 
                            alt={doc.docType}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-white/20"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-white">{doc.docType}</p>
                          {doc.reviewedAt && (
                            <p className="text-xs text-gray-400">
                              Reviewed: {new Date(doc.reviewedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === 'APPROVED' && (
                          <div className="flex items-center gap-2 text-green-400 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Approved</span>
                          </div>
                        )}
                        {doc.status === 'REJECTED' && (
                          <div className="flex items-center gap-2 text-red-400 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Rejected</span>
                          </div>
                        )}
                        {doc.status === 'PENDING' && (
                          <div className="flex items-center gap-2 text-yellow-400 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Pending</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {canConfirm && (
                  <div className="mt-6 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Ready for Confirmation</span>
                    </div>
                    <p className="text-green-300 text-sm">
                      All documents have been approved. This booking is ready to be confirmed.
                    </p>
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
            onClick={handleConfirmBooking}
            disabled={!canConfirm || confirming}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          >
            {confirming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Confirming Booking...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Booking
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
