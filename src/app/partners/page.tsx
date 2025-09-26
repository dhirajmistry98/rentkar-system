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
  Navigation,
  Eye,
  EyeOff,
  Radio,
  Zap,
  MapIcon,
  TrendingUp
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

interface Partner {
  _id: string
  name: string
  location: string
}

const StatusBadge = ({ status }: { status: string }) => {
  const configs = {
    'PENDING': { 
      bg: 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10', 
      text: 'text-amber-400', 
      border: 'border-amber-500/30',
      icon: Clock
    },
    'PARTNER_ASSIGNED': { 
      bg: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10', 
      text: 'text-blue-400', 
      border: 'border-blue-500/30',
      icon: User
    },
    'DOCUMENTS_UNDER_REVIEW': { 
      bg: 'bg-gradient-to-r from-purple-500/10 to-violet-500/10', 
      text: 'text-purple-400', 
      border: 'border-purple-500/30',
      icon: FileText
    },
    'CONFIRMED': { 
      bg: 'bg-gradient-to-r from-emerald-500/10 to-green-500/10', 
      text: 'text-emerald-400', 
      border: 'border-emerald-500/30',
      icon: CheckCircle
    },
    'APPROVED': { 
      bg: 'bg-gradient-to-r from-emerald-500/10 to-green-500/10', 
      text: 'text-emerald-400', 
      border: 'border-emerald-500/30',
      icon: CheckCircle
    },
    'REJECTED': { 
      bg: 'bg-gradient-to-r from-red-500/10 to-rose-500/10', 
      text: 'text-red-400', 
      border: 'border-red-500/30',
      icon: XCircle
    },
  }
  
  const config = configs[status as keyof typeof configs] || configs['PENDING']
  const Icon = config.icon
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border} backdrop-blur-sm`}>
      <Icon className="h-3 w-3" />
      <span className="tracking-wide">{status.replace('_', ' ')}</span>
    </div>
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
    setReviews(prev => prev.map(r => r.docType === docType ? { ...r, status } : r))
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
    <Card className="mt-6 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border-slate-700/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-3 text-white">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          Document Review Portal
        </CardTitle>
        <CardDescription className="text-gray-400">
          Review and approve submitted documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {booking.document.map((doc, index) => (
            <div key={index} className="group p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.03] hover:border-white/[0.1] transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={doc.docLink} 
                      alt={doc.docType} 
                      className="w-16 h-16 object-cover rounded-xl border-2 border-white/[0.1] shadow-lg" 
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-slate-900"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-lg">{doc.docType}</p>
                    <StatusBadge status={doc.status} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    className={`${
                      reviews.find(r => r.docType === doc.docType)?.status === 'APPROVED' 
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25' 
                        : 'bg-white/[0.05] text-gray-300 border-white/[0.1] hover:bg-white/[0.1]'
                    } transition-all duration-300`}
                    onClick={() => handleReviewChange(doc.docType, 'APPROVED')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> 
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    className={`${
                      reviews.find(r => r.docType === doc.docType)?.status === 'REJECTED' 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25' 
                        : 'bg-white/[0.05] text-gray-300 border-white/[0.1] hover:bg-white/[0.1]'
                    } transition-all duration-300`}
                    onClick={() => handleReviewChange(doc.docType, 'REJECTED')}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> 
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting} 
          className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Review...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
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
    try { await onAssignPartner(booking._id) } finally { setIsAssigning(false) }
  }

  const handleConfirmBooking = async () => {
    setIsConfirming(true)
    try { await onConfirmBooking(booking._id) } finally { setIsConfirming(false) }
  }

  const canConfirm = booking.document.every(doc => doc.status === 'APPROVED')

  return (
    <Card className="group bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-500/10">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                <Truck className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">Booking #{booking._id.slice(-8)}</CardTitle>
                <p className="text-gray-400 text-sm">ID: {booking._id.slice(-12)}</p>
              </div>
            </div>
            <StatusBadge status={booking.status} />
          </div>
          <div className="text-right">
            <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-500/20">
              <p className="text-2xl font-bold text-emerald-400">
                ₹{booking.priceBreakDown.grandTotal.toFixed(2)}
              </p>
              <p className="text-xs text-emerald-300/70">Total Amount</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span className="text-gray-300 font-medium">{new Date(booking.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
              <MapPin className="h-4 w-4 text-purple-400" />
              <span className="text-gray-300 font-medium">{booking.location.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
              <User className="h-4 w-4 text-cyan-400" />
              <span className="text-gray-300 font-medium">User: {booking.userId.slice(-8)}</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-xl border border-white/[0.05]">
            <p className="font-semibold mb-3 text-white flex items-center gap-2">
              <Navigation className="h-4 w-4 text-orange-400" />
              Delivery Address
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {booking.address.houseNumber}, {booking.address.buildingAreaName}<br/>
              {booking.address.streetAddress}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
          <p className="font-semibold mb-4 text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" />
            Document Status
          </p>
          <div className="flex gap-4 flex-wrap">
            {booking.document.map((doc, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-white/[0.05] rounded-lg">
                <span className="text-gray-300 text-sm font-medium">{doc.docType}:</span>
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
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300"
            >
              {isAssigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Assign Partner
                </>
              )}
            </Button>
          )}

          {(booking.status === 'PARTNER_ASSIGNED' || booking.status === 'DOCUMENTS_UNDER_REVIEW') && (
            <Button 
              variant="outline" 
              onClick={() => setShowReview(!showReview)}
              className="bg-white/[0.05] text-gray-300 border-white/[0.1] hover:bg-white/[0.1] hover:text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
            >
              {showReview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showReview ? 'Hide' : 'Review'} Documents
            </Button>
          )}

          {booking.status === 'DOCUMENTS_UNDER_REVIEW' && canConfirm && (
            <Button 
              onClick={handleConfirmBooking} 
              disabled={isConfirming} 
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300"
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
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl border border-emerald-500/30">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">Booking Confirmed</span>
            </div>
          )}
        </div>

        {showReview && <DocumentReview booking={booking} onReview={onReviewDocuments} />}

        {booking.lockedBy && (
          <Alert className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300">
              Currently being reviewed by admin: <strong>{booking.lockedBy}</strong>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

const PartnerCard = ({ partner, onUpdateGPS, isUpdating }: { partner: Partner, onUpdateGPS: (id: string) => void, isUpdating: boolean }) => {
  return (
    <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl">
            <User className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-white">{partner.name}</CardTitle>
            <CardDescription className="text-gray-400 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {partner.location}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => onUpdateGPS(partner._id)} 
          disabled={isUpdating}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300"
        >
          {isUpdating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Updating Location...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4 mr-2" />
              Update GPS
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

const LiveGPSTable = ({ updates }: { updates: { partnerId: string, lat: number, lng: number, time: string }[] }) => (
  <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border-slate-700/50">
    <CardHeader>
      <CardTitle className="text-white flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
          <Activity className="h-5 w-5 text-green-400" />
        </div>
        Live GPS Updates
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400 font-medium">LIVE</span>
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {updates.length === 0 ? (
          <div className="text-center py-8">
            <Radio className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No GPS updates yet</p>
            <p className="text-gray-500 text-sm">Updates will appear here in real-time</p>
          </div>
        ) : (
          updates.map((update, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.05] hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-white font-medium">{update.partnerId}</p>
                  <p className="text-gray-400 text-xs">Coordinates: {update.lat.toFixed(3)}, {update.lng.toFixed(3)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-300 text-sm">{update.time}</p>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <TrendingUp className="h-3 w-3" />
                  Active
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </CardContent>
  </Card>
)

const RateLimitIndicator = ({ partnerId, attempts }: { partnerId: string, attempts: number }) => (
  <Alert className="mb-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 backdrop-blur-sm">
    <AlertCircle className="h-4 w-4 text-amber-400" />
    <AlertDescription className="text-amber-300">
      <strong>Rate Limit Notice:</strong> Partner {partnerId} has {attempts} remaining attempts.
    </AlertDescription>
  </Alert>
)

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [adminId] = useState('admin-' + Math.random().toString(36).substr(2, 9))
  const [rateLimitAttempts, setRateLimitAttempts] = useState<{ [partnerId: string]: number }>({
    partner123: 1
  })

  const [partners] = useState<Partner[]>([
    { _id: 'partner123', name: 'John Doe', location: 'Mumbai' },
    { _id: 'partner124', name: 'Jane Smith', location: 'Pune' },
  ])

  const [gpsUpdates, setGpsUpdates] = useState<{ partnerId: string, lat: number, lng: number, time: string }[]>([])
  const [updatingPartners, setUpdatingPartners] = useState<Set<string>>(new Set())

  const handleUpdateGPS = (partnerId: string) => {
    setUpdatingPartners(prev => new Set(prev.add(partnerId)))
    setTimeout(() => {
      setGpsUpdates(prev => [...prev, { partnerId, lat: 19.0 + Math.random(), lng: 72.8 + Math.random(), time: new Date().toLocaleTimeString() }])
      setUpdatingPartners(prev => { const copy = new Set(prev); copy.delete(partnerId); return copy })
    }, 1000)
  }

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
          { docType: "SELFIE", docLink: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face", status: "PENDING" },
          { docType: "SIGNATURE", docLink: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop", status: "PENDING" }
        ],
        address: { buildingAreaName: "Pooja Enclave", houseNumber: "A/603", streetAddress: "Kandivali West, Mumbai", latitude: 19.203258, longitude: 72.8278919 },
        priceBreakDown: { grandTotal: 1580.02 },
        status: "PENDING"
      }
    ]
    setTimeout(() => { setBookings(sampleBookings); setLoading(false) }, 1000)
  }, [])

  const handleAssignPartner = async (bookingId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'PARTNER_ASSIGNED', partnerId: 'partner123' } : b))
    alert(`Partner assigned to booking ${bookingId.slice(-8)}`)
  }

  const handleConfirmBooking = async (bookingId: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'CONFIRMED', lockedBy: undefined } : b))
    alert(`Booking ${bookingId.slice(-8)} confirmed successfully!`)
  }

  const handleReviewDocuments = async (bookingId: string, reviews: any[]) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    setBookings(prev => prev.map(b => {
      if (b._id === bookingId) {
        const updatedDocuments = b.document.map(doc => {
          const review = reviews.find(r => r.docType === doc.docType)
          return review ? { ...doc, status: review.status as any } : doc
        })
        return { ...b, document: updatedDocuments, status: 'DOCUMENTS_UNDER_REVIEW', lockedBy: adminId }
      }
      return b
    }))
    alert('Document review submitted successfully!')
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="text-center relative z-10">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-transparent bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 mx-auto"></div>
          <div className="absolute inset-4 bg-gray-950 rounded-full"></div>
          <Truck className="h-8 w-8 text-blue-400 absolute top-12 left-12" />
        </div>
        <p className="text-white text-xl font-semibold mb-2">Loading Partner Tracking</p>
        <p className="text-gray-400">Initializing real-time monitoring...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/2 left-1/3 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" asChild className="bg-white/[0.05] border-white/[0.1] hover:bg-white/[0.1] text-white">
              <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl">
                  <Truck className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Partner Tracking Hub
                  </h1>
                  <p className="text-gray-400 text-lg">Real-time partner monitoring and GPS analytics</p>
                </div>
              </div>
              
              {/* Status Indicators */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full border border-emerald-500/30">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-300 text-sm font-medium">Live Tracking Active</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30">
                  <MapIcon className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-300 text-sm font-medium">{partners.length} Partners Online</span>
                </div>
              </div>
            </div>
            <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300">
              <Link href="/partners/tracking">
                <Navigation className="h-4 w-4 mr-2" />
                Live Tracking
              </Link>
            </Button>
          </div>
        </div>

        {Object.keys(rateLimitAttempts).length > 0 && (
          <RateLimitIndicator partnerId={Object.keys(rateLimitAttempts)[0]} attempts={Object.values(rateLimitAttempts)[0]} />
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Bookings Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                Active Bookings
              </h2>
              <p className="text-gray-400">Manage and track booking assignments</p>
            </div>
            
            <div className="space-y-6">
              {bookings.map(booking => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onAssignPartner={handleAssignPartner}
                  onConfirmBooking={handleConfirmBooking}
                  onReviewDocuments={handleReviewDocuments}
                />
              ))}
            </div>
          </div>

          {/* Sidebar with GPS and Partners */}
          <div className="lg:col-span-1 space-y-6">
            {/* Live GPS Updates */}
            <LiveGPSTable updates={gpsUpdates} />
            
            {/* Partner Controls */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl">
                  <User className="h-5 w-5 text-emerald-400" />
                </div>
                Partner Network
              </h3>
              <div className="space-y-4">
                {partners.map(partner => (
                  <PartnerCard
                    key={partner._id}
                    partner={partner}
                    onUpdateGPS={handleUpdateGPS}
                    isUpdating={updatingPartners.has(partner._id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}