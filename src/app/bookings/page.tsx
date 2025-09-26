// src/app/bookings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { 
  Calendar, 
  MapPin, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Clock,
  Truck,
  Activity,
  DollarSign,
  Search,
  Filter
} from 'lucide-react'
import Link from 'next/link'

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
  packageId: string
  startDate: string
  endDate: string
  location: string
  document: Document[]
  address: {
    buildingAreaName: string
    houseNumber: string
    streetAddress: string
    latitude: number
    longitude: number
  }
  priceBreakDown: {
    grandTotal: number
  }
  status: 'PENDING' | 'PARTNER_ASSIGNED' | 'DOCUMENTS_UNDER_REVIEW' | 'CONFIRMED'
  partnerId?: string
  lockedBy?: string
}

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    'PENDING': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'PARTNER_ASSIGNED': 'bg-blue-500/20 text-blue-300 border-blue-500/30', 
    'DOCUMENTS_UNDER_REVIEW': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'CONFIRMED': 'bg-green-500/20 text-green-300 border-green-500/30',
    'APPROVED': 'bg-green-500/20 text-green-300 border-green-500/30',
    'REJECTED': 'bg-red-500/20 text-red-300 border-red-500/30',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

const DocumentReview = ({ booking, onReview }: { 
  booking: Booking
  onReview: (bookingId: string, reviews: any[]) => void
}) => {
  const [reviews, setReviews] = useState<{ docType: string; status: string }[]>(
    booking.document.map(doc => ({ docType: doc.docType, status: doc.status }))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReviewChange = (docType: string, status: string) => {
    setReviews(prev => prev.map(r => 
      r.docType === docType ? { ...r, status } : r
    ))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onReview(booking._id, reviews)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mt-6 bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <FileText className="h-5 w-5 text-purple-400" />
          </div>
          Document Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {booking.document.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={doc.docLink} 
                    alt={doc.docType}
                    className="w-16 h-16 object-cover rounded-lg border-2 border-white/20"
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <FileText className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-white">{doc.docType}</p>
                  <StatusBadge status={doc.status} />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className={reviews.find(r => r.docType === doc.docType)?.status === 'APPROVED' 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }
                  onClick={() => handleReviewChange(doc.docType, 'APPROVED')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  className={reviews.find(r => r.docType === doc.docType)?.status === 'REJECTED' 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }
                  onClick={() => handleReviewChange(doc.docType, 'REJECTED')}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full mt-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 font-semibold"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Submit Review
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

const BookingCard = ({ booking, onAssignPartner, onConfirmBooking, onReviewDocuments }: {
  booking: Booking
  onAssignPartner: (bookingId: string) => void
  onConfirmBooking: (bookingId: string) => void
  onReviewDocuments: (bookingId: string, reviews: any[]) => void
}) => {
  const [isAssigning, setIsAssigning] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [showReview, setShowReview] = useState(false)

  const handleAssignPartner = async () => {
    setIsAssigning(true)
    try {
      await onAssignPartner(booking._id)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleConfirmBooking = async () => {
    setIsConfirming(true)
    try {
      await onConfirmBooking(booking._id)
    } finally {
      setIsConfirming(false)
    }
  }

  const canConfirm = booking.document.every(doc => doc.status === 'APPROVED')

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'PENDING': return 'from-yellow-500/10 to-orange-500/5 border-yellow-500/20'
      case 'PARTNER_ASSIGNED': return 'from-blue-500/10 to-blue-600/5 border-blue-500/20'
      case 'DOCUMENTS_UNDER_REVIEW': return 'from-purple-500/10 to-purple-600/5 border-purple-500/20'
      case 'CONFIRMED': return 'from-green-500/10 to-emerald-600/5 border-green-500/20'
      default: return 'from-gray-500/10 to-gray-600/5 border-gray-500/20'
    }
  }

  return (
    <Card className={`w-full bg-gradient-to-br ${getStatusGradient(booking.status)} backdrop-blur-xl border hover:scale-[1.01] transition-all duration-300 group hover:shadow-2xl`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">Booking #{booking._id.slice(-8).toUpperCase()}</CardTitle>
                <StatusBadge status={booking.status} />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-400" />
              <p className="text-2xl font-bold text-green-400">
                ₹{booking.priceBreakDown.grandTotal.toFixed(2)}
              </p>
            </div>
            <p className="text-xs text-gray-400">Total Amount</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300 bg-white/5 p-3 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-xs text-gray-400">Start Date</p>
                <span className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-300 bg-white/5 p-3 rounded-lg">
              <MapPin className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <span className="font-medium">{booking.location.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-300 bg-white/5 p-3 rounded-lg">
              <User className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-xs text-gray-400">User ID</p>
                <span className="font-medium">{booking.userId.slice(-8).toUpperCase()}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-blue-400" />
              <p className="font-medium text-white">Delivery Address</p>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {booking.address.houseNumber}, {booking.address.buildingAreaName}<br/>
              {booking.address.streetAddress}
            </p>
          </div>
        </div>

        <div className="mb-6 bg-white/5 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-green-400" />
            <p className="font-medium text-white">Documents Status</p>
          </div>
          <div className="flex gap-4 flex-wrap">
            {booking.document.map((doc, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                <span className="text-sm font-medium text-gray-300">{doc.docType}:</span>
                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {booking.status === 'PENDING' && (
            <Button
              onClick={handleAssignPartner}
              disabled={isAssigning}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 font-semibold"
            >
              {isAssigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Assign Partner
                </>
              )}
            </Button>
          )}

          {(booking.status === 'PARTNER_ASSIGNED' || booking.status === 'DOCUMENTS_UNDER_REVIEW') && (
            <Button
              onClick={() => setShowReview(!showReview)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2 font-semibold"
            >
              <FileText className="h-4 w-4 mr-2" />
              {showReview ? 'Hide' : 'Review'} Documents
            </Button>
          )}

          {booking.status === 'DOCUMENTS_UNDER_REVIEW' && canConfirm && (
            <Button
              onClick={handleConfirmBooking}
              disabled={isConfirming}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 font-semibold"
            >
              {isConfirming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          )}

          {booking.status === 'CONFIRMED' && (
            <div className="flex items-center gap-2 text-green-400 bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/30">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Booking Confirmed</span>
            </div>
          )}
        </div>

        {showReview && (
          <DocumentReview 
            booking={booking} 
            onReview={onReviewDocuments}
          />
        )}

        {booking.lockedBy && (
          <Alert className="mt-4 bg-orange-500/20 border-orange-500/30">
            <AlertCircle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-300">
              Currently being reviewed by admin: <span className="font-medium">{booking.lockedBy}</span>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [adminId] = useState('admin-' + Math.random().toString(36).substr(2, 9))

  useEffect(() => {
    const sampleBookings: Booking[] = [
      {
        _id: "687761e7c5bc4044c6d75cb3",
        userId: "68108f18d1224f8f22316a7b",
        packageId: "685612cd3225791ecbb86b6e",
        startDate: "2025-07-19T00:00:00.000Z",
        endDate: "2025-07-20T00:00:00.000Z",
        location: "mumbai",
        document: [
          {
            docType: "SELFIE",
            docLink: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            status: "PENDING"
          },
          {
            docType: "SIGNATURE",
            docLink: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
            status: "PENDING"
          }
        ],
        address: {
          buildingAreaName: "Pooja Enclave",
          houseNumber: "A/603",
          streetAddress: "Kandivali West, Mumbai",
          latitude: 19.203258,
          longitude: 72.8278919
        },
        priceBreakDown: {
          grandTotal: 1580.02
        },
        status: "PENDING"
      },
      {
        _id: "687761e7c5bc4044c6d75cb4",
        userId: "68108f18d1224f8f22316a7c",
        packageId: "685612cd3225791ecbb86b6f",
        startDate: "2025-07-20T00:00:00.000Z",
        endDate: "2025-07-21T00:00:00.000Z",
        location: "mumbai",
        document: [
          {
            docType: "SELFIE",
            docLink: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            status: "APPROVED"
          },
          {
            docType: "SIGNATURE",
            docLink: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
            status: "APPROVED"
          }
        ],
        address: {
          buildingAreaName: "Green Valley",
          houseNumber: "B/204",
          streetAddress: "Andheri East, Mumbai",
          latitude: 19.1136,
          longitude: 72.8697
        },
        priceBreakDown: {
          grandTotal: 2100.50
        },
        status: "DOCUMENTS_UNDER_REVIEW",
        partnerId: "partner123"
      }
    ]

    setTimeout(() => {
      setBookings(sampleBookings)
      setLoading(false)
    }, 1000)
  }, [])

  const handleAssignPartner = async (bookingId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setBookings(prev => prev.map(booking => 
      booking._id === bookingId 
        ? { ...booking, status: 'PARTNER_ASSIGNED', partnerId: 'partner123' }
        : booking
    ))
    
    alert(`Partner assigned to booking ${bookingId.slice(-8)}`)
  }

  const handleConfirmBooking = async (bookingId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setBookings(prev => prev.map(booking => 
      booking._id === bookingId 
        ? { ...booking, status: 'CONFIRMED', lockedBy: undefined }
        : booking
    ))
    
    alert(`Booking ${bookingId.slice(-8)} confirmed successfully!`)
  }

  const handleReviewDocuments = async (bookingId: string, reviews: any[]) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setBookings(prev => prev.map(booking => {
      if (booking._id === bookingId) {
        const updatedDocuments = booking.document.map(doc => {
          const review = reviews.find(r => r.docType === doc.docType)
          return review ? { ...doc, status: review.status as any } : doc
        })
        
        return {
          ...booking,
          document: updatedDocuments,
          status: 'DOCUMENTS_UNDER_REVIEW',
          lockedBy: adminId
        }
      }
      return booking
    }))
    
    alert('Document review submitted successfully!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-500/30 border-t-blue-500 mb-6 mx-auto"></div>
          <p className="text-white text-xl font-semibold">Loading bookings...</p>
          <p className="text-gray-400 mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl animate-bounce"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button className="bg-white/10 hover:bg-white/20 border-white/20 text-white" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Bookings Management</h1>
                  <p className="text-gray-400 text-sm">Admin ID: {adminId}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  placeholder="Search bookings..."
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <Button className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <div className="flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { 
              icon: Clock, 
              label: "Pending", 
              value: bookings.filter(b => b.status === 'PENDING').length,
              color: "text-yellow-400",
              bg: "from-yellow-500/10 to-yellow-600/5",
              border: "border-yellow-500/20"
            },
            { 
              icon: Truck, 
              label: "Partner Assigned", 
              value: bookings.filter(b => b.status === 'PARTNER_ASSIGNED').length,
              color: "text-blue-400",
              bg: "from-blue-500/10 to-blue-600/5",
              border: "border-blue-500/20"
            },
            { 
              icon: FileText, 
              label: "Under Review", 
              value: bookings.filter(b => b.status === 'DOCUMENTS_UNDER_REVIEW').length,
              color: "text-purple-400",
              bg: "from-purple-500/10 to-purple-600/5",
              border: "border-purple-500/20"
            },
            { 
              icon: CheckCircle, 
              label: "Confirmed", 
              value: bookings.filter(b => b.status === 'CONFIRMED').length,
              color: "text-green-400",
              bg: "from-green-500/10 to-emerald-600/5",
              border: "border-green-500/20"
            }
          ].map((stat, index) => (
            <Card key={index} className={`bg-gradient-to-br ${stat.bg} backdrop-blur-xl border ${stat.border} hover:scale-105 transition-all duration-300 group`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} group-hover:scale-110 transition-transform`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">All Bookings</h2>
            <p className="text-gray-400">Manage and track all booking requests</p>
          </div>

          {bookings.length === 0 ? (
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="text-center py-16">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
                <p className="text-gray-400">New bookings will appear here automatically</p>
              </CardContent>
            </Card>
          ) : (
            bookings.map(booking => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onAssignPartner={handleAssignPartner}
                onConfirmBooking={handleConfirmBooking}
                onReviewDocuments={handleReviewDocuments}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-white/10">
          <p className="text-gray-400">
            © 2024 Rentkar Bookings Management. Built for efficiency and scale.
          </p>
        </div>
      </div>
    </div>
  )
}