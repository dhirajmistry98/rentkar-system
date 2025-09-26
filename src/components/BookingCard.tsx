import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Calendar, MapPin, User, Package } from 'lucide-react'

interface BookingCardProps {
  booking: {
    _id: string
    userId: string
    startDate: string
    location: string
    status: string
    priceBreakDown: {
      grandTotal: number
    }
  }
  onAction: (id: string, action: string) => void
}

export default function BookingCard({ booking, onAction }: BookingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>#{booking._id.slice(-8)}</span>
          <Badge variant="outline">{booking.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            {new Date(booking.startDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            {booking.location}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            {booking.userId.slice(-8)}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">
            ₹{booking.priceBreakDown.grandTotal}
          </span>
          <Button onClick={() => onAction(booking._id, 'view')}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}