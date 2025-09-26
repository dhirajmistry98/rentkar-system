import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { CheckCircle, XCircle, FileText } from 'lucide-react'

interface Document {
  docType: string
  docLink: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

interface DocumentReviewProps {
  documents: Document[]
  onReview: (reviews: { docType: string; status: string }[]) => void
}

export default function DocumentReview({ documents, onReview }: DocumentReviewProps) {
  const [reviews, setReviews] = useState<{ docType: string; status: string }[]>(
    documents.map(doc => ({ docType: doc.docType, status: doc.status }))
  )

  const handleReviewChange = (docType: string, status: string) => {
    setReviews(prev => prev.map(r => 
      r.docType === docType ? { ...r, status } : r
    ))
  }

  const handleSubmit = () => {
    onReview(reviews)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded">
              <div className="flex items-center gap-4">
                <img 
                  src={doc.docLink} 
                  alt={doc.docType}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{doc.docType}</p>
                  <Badge variant="outline">{doc.status}</Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={reviews.find(r => r.docType === doc.docType)?.status === 'APPROVED' ? 'default' : 'outline'}
                  onClick={() => handleReviewChange(doc.docType, 'APPROVED')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant={reviews.find(r => r.docType === doc.docType)?.status === 'REJECTED' ? 'destructive' : 'outline'}
                  onClick={() => handleReviewChange(doc.docType, 'REJECTED')}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <Button onClick={handleSubmit} className="w-full mt-4">
          Submit Review
        </Button>
      </CardContent>
    </Card>
  )
}