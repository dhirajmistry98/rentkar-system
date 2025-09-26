'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Alert, AlertDescription } from '../../../../components/ui/alert'
import { ArrowLeft, FileText, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react'

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
  status: string
  document: Document[]
}

export default function ReviewDocumentsPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [reviews, setReviews] = useState<{ docType: string; status: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    fetchBooking()
  }, [params.id])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch booking')
      const data = await response.json()
      setBooking(data.data)
      
      // Initialize reviews with current status
      setReviews(data.data.document.map((doc: Document) => ({
        docType: doc.docType,
        status: doc.status
      })))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewChange = (docType: string, status: string) => {
    setReviews(prev => prev.map(r => 
      r.docType === docType ? { ...r, status } : r
    ))
  }

  const handleSubmitReviews = async () => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/bookings/${params.id}/review-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: 'admin-' + Math.random().toString(36).substr(2, 9),
          reviews: reviews
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit reviews')
      }

      // Redirect back to booking details with success message
      router.push(`/bookings/${params.id}?reviewed=true`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-500/30 border-t-blue-500 mb-6 mx-auto"></div>
          <p className="text-white text-xl font-semibold">Loading documents...</p>
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
            <h1 className="text-3xl font-bold text-white">Review Documents</h1>
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
          <div className="space-y-6">
            {booking.document.map((doc, index) => {
              const currentReview = reviews.find(r => r.docType === doc.docType)
              
              return (
                <Card key={index} className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {doc.docType} Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Document Preview */}
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={doc.docLink}
                            alt={doc.docType}
                            className="w-full max-w-md mx-auto rounded-lg border-2 border-white/20 cursor-pointer hover:border-blue-500/50 transition-colors"
                            onClick={() => setSelectedImage(doc.docLink)}
                          />
                          <Button
                            size="sm"
                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                            onClick={() => setSelectedImage(doc.docLink)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Full
                          </Button>
                        </div>
                        
                        <div className="bg-white/5 p-4 rounded-lg">
                          <p className="text-gray-400 text-sm mb-2">Current Status</p>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            doc.status === 'APPROVED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            doc.status === 'REJECTED' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}>
                            {doc.status === 'APPROVED' && <CheckCircle className="h-4 w-4 mr-1" />}
                            {doc.status === 'REJECTED' && <XCircle className="h-4 w-4 mr-1" />}
                            {doc.status === 'PENDING' && <AlertCircle className="h-4 w-4 mr-1" />}
                            {doc.status}
                          </div>
                          {doc.reviewedAt && (
                            <p className="text-xs text-gray-400 mt-2">
                              Last reviewed: {new Date(doc.reviewedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Review Actions */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-white font-medium mb-4">Review Action</h3>
                          <div className="space-y-3">
                            <Button
                              className={`w-full justify-start ${
                                currentReview?.status === 'APPROVED' 
                                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                              }`}
                              onClick={() => handleReviewChange(doc.docType, 'APPROVED')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve Document
                            </Button>
                            
                            <Button
                              className={`w-full justify-start ${
                                currentReview?.status === 'REJECTED' 
                                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                              }`}
                              onClick={() => handleReviewChange(doc.docType, 'REJECTED')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Document
                            </Button>
                          </div>
                        </div>

                        {/* Review Guidelines */}
                        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                          <h4 className="text-blue-300 font-medium mb-2">Review Guidelines</h4>
                          <ul className="text-blue-200 text-sm space-y-1">
                            {doc.docType === 'SELFIE' ? (
                              <>
                                <li>• Face should be clearly visible</li>
                                <li>• No sunglasses or face coverings</li>
                                <li>• Good lighting and image quality</li>
                                <li>• Person should be looking at camera</li>
                              </>
                            ) : (
                              <>
                                <li>• Signature should be legible</li>
                                <li>• Written on clean background</li>
                                <li>• Clear and unblurred image</li>
                                <li>• Matches expected format</li>
                              </>
                            )}
                          </ul>
                        </div>

                        {currentReview?.status && currentReview.status !== doc.status && (
                          <div className="bg-orange-500/20 p-3 rounded-lg border border-orange-500/30">
                            <p className="text-orange-300 text-sm">
                              You have changed the status to <strong>{currentReview.status}</strong>. 
                              Click "Submit All Reviews" to save your changes.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" asChild className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Link href={`/bookings/${params.id}`}>
              Cancel
            </Link>
          </Button>
          <Button
            onClick={handleSubmitReviews}
            disabled={submitting}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Reviews...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Submit All Reviews
              </>
            )}
          </Button>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <img
                src={selectedImage}
                alt="Document preview"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70"
                onClick={() => setSelectedImage(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}